// IMPORTANTE: Asegúrate que la ruta a tu archivo firebaseConfig sea correcta
import { Customer } from '@/types'; // Ajusta la ruta a tus types si es diferente
import { db } from '../firebaseConfig'; // Importa TU instancia de Firestore
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    runTransaction,
    addDoc,
    Timestamp 
} from "firebase/firestore";

// --- findCustomerByPhone (Sin cambios, pero con logs de error) ---
export const findCustomerByPhone = async (phone: string): Promise<Customer | undefined> => {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("phone", "==", phone));
    try { 
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return undefined;
        }
        const customerDoc = querySnapshot.docs[0];
        return { id: customerDoc.id, ...customerDoc.data() } as Customer;
    } catch (error) {
        console.error("Error en findCustomerByPhone:", error);
        throw new Error("Error al buscar cliente.");
    }
};

// --- registerCustomer (ACTUALIZADO: Agregamos xp inicial) ---
export const registerCustomer = async (name: string, phone: string): Promise<Customer> => {
    const existingCustomer = await findCustomerByPhone(phone);
    if (existingCustomer) {
        throw new Error('Este número de teléfono ya está registrado.');
    }
    // NUEVO: Agregamos el campo xp: 0 para los clientes nuevos
    const newCustomerData = { name, phone, points: 0, xp: 0, level: 0, createdAt: Timestamp.now() }; 
    try { 
        const docRef = await addDoc(collection(db, "customers"), newCustomerData);
        return { id: docRef.id, ...newCustomerData } as Customer;
    } catch (error) {
        console.error("Error en registerCustomer:", error);
        throw new Error("Error al registrar cliente.");
    }
};

// --- addPoints (ACTUALIZADO: Lógica separada para Puntos y XP) ---
export const addPoints = async (phone: string, purchaseAmount: number, pointsToRedeem: number = 0): Promise<{ customer: Customer, pointsEarned: number, newTotalPoints: number }> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para añadir puntos.');
    
    const customerRef = doc(db, "customers", customer.id);
    const pointsEarned = Math.floor(purchaseAmount / 100); 
    
    let newTotalPoints = customer.points || 0; 
    let newTotalXp = (customer as any).xp || 0; // Casteo seguro por si xp no está en tu interfaz antigua

    try { 
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(customerRef);
            if (!sfDoc.exists()) {
                throw "El documento del cliente no existe.";
            }
            
            // Leemos los valores actuales directamente del servidor en el milisegundo exacto
            const currentPoints = sfDoc.data().points || 0;
            const currentXp = sfDoc.data().xp || 0;
            
            // CÁLCULO DE PUNTOS: (Puntos Actuales) - (Lo que gastó en la tienda) + (Lo que ganó por cargar gasolina)
            newTotalPoints = currentPoints - pointsToRedeem + pointsEarned; 
            
            // CÁLCULO DE XP: (Experiencia Actual) + (Lo que ganó por cargar gasolina). ¡La XP NUNCA se resta!
            newTotalXp = currentXp + pointsEarned;

            if (newTotalPoints < 0) { 
                console.warn("Cálculo de puntos resultó negativo, ajustando a 0.");
                newTotalPoints = 0;
            }
            
            console.log(`[addPoints] Transacción: Actualizando puntos de ${currentPoints} a ${newTotalPoints} | XP de ${currentXp} a ${newTotalXp}`);
            
            // Guardamos AMBOS valores en la base de datos
            transaction.update(customerRef, { 
                points: newTotalPoints,
                xp: newTotalXp
            });
        });

        return { 
            // Retornamos el cliente actualizado con su nueva XP y sus nuevos Puntos
            customer: { ...customer, points: newTotalPoints, xp: newTotalXp } as Customer, 
            pointsEarned, 
            newTotalPoints 
        };
    } catch (error) {
         console.error("Error en runTransaction de addPoints:", error);
         if (error instanceof Error) throw error; 
         throw new Error("No se pudieron actualizar los puntos.");
    }
};


// --- saveSaleRecord (Sin cambios - CON DEPURACIÓN) ---
/**
 * Guarda un registro de venta (ticket) en la colección 'sales' de Firestore.
 */
export const saveSaleRecord = async (saleData: any) => {
    console.log("[saveSaleRecord] Iniciando guardado de venta. Datos recibidos:", saleData); // PUNTO DE CONTROL
    const salesColRef = collection(db, "sales");
    try {
        const dataToSave = {
            ...saleData,
            date: Timestamp.fromDate(saleData.date || new Date()), 
            // La data ya viene con customerId: null o el ID, lo cual es correcto.
        };

        console.log("[saveSaleRecord] Datos listos para Firestore:", dataToSave); // PUNTO DE CONTROL
        const docRef = await addDoc(salesColRef, dataToSave);
        
        console.log("[saveSaleRecord] ¡ÉXITO! Venta guardada con ID:", docRef.id); // PUNTO DE CONTROL
        return docRef.id;
    } catch (error: any) {
        // ESTE ES EL ERROR MÁS IMPORTANTE
        console.error("¡¡ERROR DE FIREBASE AL GUARDAR LA VENTA!!:", error);
        console.error("Código de Error:", error.code); // Específicamente el código de error
        console.error("Mensaje de Error:", error.message);
        throw new Error(`No se pudo guardar la venta: ${error.message}`);
    }
};

// --- redeemPoints (ACTUALIZADO: Solo toca los puntos, no la XP) ---
export const redeemPoints = async (phone: string, pointsToRedeem: number): Promise<Customer> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para canjear puntos.');

    const customerRef = doc(db, "customers", customer.id);
    let finalPoints = customer.points || 0; 

    try { 
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(customerRef);
            if (!sfDoc.exists()) {
                throw "El documento del cliente no existe.";
            }

            const currentPoints = sfDoc.data().points || 0;

            if (currentPoints < pointsToRedeem) {
                throw new Error("Puntos insuficientes para realizar el canje.");
            }

            // Solo restamos de "points". La "xp" se queda intacta.
            finalPoints = currentPoints - pointsToRedeem;
            
            transaction.update(customerRef, { points: finalPoints });
        });
        return { ...customer, points: finalPoints } as Customer; 
    } catch (error) {
         console.error("Error en runTransaction de redeemPoints:", error);
         if (error instanceof Error) throw error;
         throw new Error("No se pudieron canjear los puntos.");
    }
};