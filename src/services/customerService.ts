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
    Timestamp // Importa Timestamp para guardar fechas correctamente
} from "firebase/firestore";
// Asume que tu tipo Customer está definido en '../types'
// import type { Customer } from '../types';

export const findCustomerByPhone = async (phone: string): Promise<Customer | undefined> => {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("phone", "==", phone));
    try { // Añadido try/catch básico
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return undefined;
        }
        const customerDoc = querySnapshot.docs[0];
        return { id: customerDoc.id, ...customerDoc.data() } as Customer;
    } catch (error) {
        console.error("Error buscando cliente por teléfono:", error);
        throw new Error("Error al buscar cliente."); // Relanza el error
    }
};

export const registerCustomer = async (name: string, phone: string): Promise<Customer> => {
    const existingCustomer = await findCustomerByPhone(phone);
    if (existingCustomer) {
        throw new Error('Este número de teléfono ya está registrado.');
    }
    const newCustomerData = { name, phone, points: 0, createdAt: Timestamp.now() }; // Añadido createdAt
    try { // Añadido try/catch
        const docRef = await addDoc(collection(db, "customers"), newCustomerData);
        return { id: docRef.id, ...newCustomerData };
    } catch (error) {
        console.error("Error registrando cliente:", error);
        throw new Error("Error al registrar cliente."); // Relanza el error
    }
};

export const addPoints = async (phone: string, purchaseAmount: number, pointsToRedeem: number = 0): Promise<{ customer: Customer, pointsEarned: number, newTotalPoints: number }> => {
    // Nota: Modificada para calcular puntos y devolver más info.
    // Considera si esta lógica debe vivir aquí o en el backend/POSScreen.
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para añadir puntos.');
    
    const customerRef = doc(db, "customers", customer.id);
    // Calcula puntos ganados sobre el monto final (asumiendo que purchaseAmount es el total pagado)
    const pointsEarned = Math.floor(purchaseAmount / 10); 
    let newTotalPoints = customer.points; // Inicializa con los puntos actuales

    try { // Añadido try/catch
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(customerRef);
            if (!sfDoc.exists()) {
                throw "El documento del cliente no existe.";
            }
            const currentPoints = sfDoc.data().points;
            // Calcula el nuevo total considerando puntos canjeados y ganados
            newTotalPoints = currentPoints - pointsToRedeem + pointsEarned; 
            if (newTotalPoints < 0) { // Seguridad extra
                console.warn("Cálculo de puntos resultó negativo, ajustando a 0.");
                newTotalPoints = 0;
            }
            transaction.update(customerRef, { points: newTotalPoints });
        });

        // Devuelve el cliente con los puntos actualizados y detalles
        return { 
            customer: { ...customer, points: newTotalPoints }, 
            pointsEarned, 
            newTotalPoints 
        };
    } catch (error) {
         console.error("Error en transacción de puntos:", error);
         // Decide cómo manejar el error, ¿relanzar o devolver estado anterior?
         // Por ahora, relanzamos para que POSScreen sepa que falló.
         if (error instanceof Error) throw error; // Relanza si es Error
         throw new Error("No se pudieron actualizar los puntos."); // Error genérico
    }
};


// --- NUEVA FUNCIÓN ---
/**
 * Guarda un registro de venta (ticket) en la colección 'sales' de Firestore.
 * @param {object} saleData - El objeto del ticket generado en POSScreen.
 * @returns {Promise<string>} El ID del documento de venta guardado.
 */
export const saveSaleRecord = async (saleData) => {
    const salesColRef = collection(db, "sales");
    try {
        // Prepara los datos para Firestore
        const dataToSave = {
            ...saleData,
            // Convierte la fecha JS a Timestamp de Firestore para mejor indexación/queries
            date: Timestamp.fromDate(saleData.date || new Date()), 
            // Guarda solo el ID del cliente si existe
            customerId: saleData.customer ? saleData.customer.id : null, 
            // Podrías quitar el objeto customer completo si ya tienes el ID
            // customer: null, // Opcional: quitar redundancia
        };
        // Elimina el objeto customer completo si decides no guardarlo
        // delete dataToSave.customer; 

        const docRef = await addDoc(salesColRef, dataToSave);
        console.log("Venta guardada con ID: ", docRef.id);
        return docRef.id; // Devuelve el ID de la venta guardada
    } catch (error) {
        console.error("Error guardando la venta: ", error);
        throw new Error("No se pudo guardar el registro de la venta.");
    }
};

// redeemPoints (modificado ligeramente para consistencia y try/catch)
export const redeemPoints = async (phone: string, pointsToRedeem: number): Promise<Customer> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado para canjear puntos.');

    const customerRef = doc(db, "customers", customer.id);
    let finalPoints = customer.points; // Para devolver el estado actualizado

    try { // Añadido try/catch
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(customerRef);
            if (!sfDoc.exists()) {
                throw "El documento del cliente no existe.";
            }
            const currentPoints = sfDoc.data().points;
            if (currentPoints < pointsToRedeem) {
                throw new Error("Puntos insuficientes.");
            }
            const newPoints = currentPoints - pointsToRedeem;
            finalPoints = newPoints; // Actualiza la variable
            transaction.update(customerRef, { points: newPoints });
        });

        return { ...customer, points: finalPoints }; // Devuelve cliente con puntos actualizados
    } catch (error) {
         console.error("Error en transacción de canje:", error);
         if (error instanceof Error) throw error;
         throw new Error("No se pudieron canjear los puntos.");
    }
};
