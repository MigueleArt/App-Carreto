// IMPORTANTE: Asegúrate que la ruta a tu archivo firebaseConfig sea correcta
import { Customer } from '@/types';
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

// --- registerCustomer (Sin cambios, pero con logs de error) ---
export const registerCustomer = async (name: string, phone: string): Promise<Customer> => {
    const existingCustomer = await findCustomerByPhone(phone);
    if (existingCustomer) {
        throw new Error('Este número de teléfono ya está registrado.');
    }
    const newCustomerData = { name, phone, points: 0, createdAt: Timestamp.now() }; 
    try { 
        const docRef = await addDoc(collection(db, "customers"), newCustomerData);
        return { id: docRef.id, ...newCustomerData };
    } catch (error) {
        console.error("Error en registerCustomer:", error);
        throw new Error("Error al registrar cliente.");
    }
};

// --- addPoints (Con logs de error) ---
export const addPoints = async (phone: string, purchaseAmount: number, pointsToRedeem: number = 0): Promise<{ customer: Customer, pointsEarned: number, newTotalPoints: number }> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para añadir puntos.');
    
    const customerRef = doc(db, "customers", customer.id);
    const pointsEarned = Math.floor(purchaseAmount / 10); 
    let newTotalPoints = customer.points; 

    try { 
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(customerRef);
            if (!sfDoc.exists()) {
                throw "El documento del cliente no existe.";
            }
            const currentPoints = sfDoc.data().points;
            newTotalPoints = currentPoints - pointsToRedeem + pointsEarned; 
            if (newTotalPoints < 0) { 
                console.warn("Cálculo de puntos resultó negativo, ajustando a 0.");
                newTotalPoints = 0;
            }
            console.log(`[addPoints] Transacción: Actualizando puntos de ${currentPoints} a ${newTotalPoints}`);
            transaction.update(customerRef, { points: newTotalPoints });
        });

        return { 
            customer: { ...customer, points: newTotalPoints }, 
            pointsEarned, 
            newTotalPoints 
        };
    } catch (error) {
         console.error("Error en runTransaction de addPoints:", error);
         if (error instanceof Error) throw error; 
         throw new Error("No se pudieron actualizar los puntos.");
    }
};


// --- saveSaleRecord (CON DEPURACIÓN) ---
/**
 * Guarda un registro de venta (ticket) en la colección 'sales' de Firestore.
 */
export const saveSaleRecord = async (saleData) => {
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
    } catch (error) {
        // ESTE ES EL ERROR MÁS IMPORTANTE
        console.error("¡¡ERROR DE FIREBASE AL GUARDAR LA VENTA!!:", error);
        console.error("Código de Error:", error.code); // Específicamente el código de error
        console.error("Mensaje de Error:", error.message);
        throw new Error(`No se pudo guardar la venta: ${error.message}`);
    }
};

// --- redeemPoints (Con logs de error) ---
export const redeemPoints = async (phone: string, pointsToRedeem: number): Promise<Customer> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para canjear puntos.');

    const customerRef = doc(db, "customers", customer.id);
    let finalPoints = customer.points; 

    try { 
        await runTransaction(db, async (transaction) => {
            // ... (lógica de transacción)
        });
        return { ...customer, points: finalPoints }; 
    } catch (error) {
         console.error("Error en runTransaction de redeemPoints:", error);
         if (error instanceof Error) throw error;
         throw new Error("No se pudieron canjear los puntos.");
    }
};