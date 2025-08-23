import { db } from '../firebaseConfig';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    runTransaction,
    addDoc
} from "firebase/firestore";
import type { Customer } from '../types';

export const findCustomerByPhone = async (phone: string): Promise<Customer | undefined> => {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return undefined;
    }
    const customerDoc = querySnapshot.docs[0];
    return { id: customerDoc.id, ...customerDoc.data() } as Customer;
};

export const registerCustomer = async (name: string, phone: string): Promise<Customer> => {
    const existingCustomer = await findCustomerByPhone(phone);
    if (existingCustomer) {
        throw new Error('Este número de teléfono ya está registrado.');
    }
    const newCustomerData = { name, phone, points: 0 };
    const docRef = await addDoc(collection(db, "customers"), newCustomerData);
    return { id: docRef.id, ...newCustomerData };
};

export const addPoints = async (phone: string, purchaseAmount: number): Promise<Customer> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado.');
    
    const customerRef = doc(db, "customers", customer.id);
    const pointsToAdd = Math.floor(purchaseAmount / 10);
    
    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(customerRef);
        if (!sfDoc.exists()) {
            throw "El documento del cliente no existe.";
        }
        const newPoints = sfDoc.data().points + pointsToAdd;
        transaction.update(customerRef, { points: newPoints });
    });

    return { ...customer, points: customer.points + pointsToAdd };
};

export const redeemPoints = async (phone: string, pointsToRedeem: number): Promise<Customer> => {
    const customer = await findCustomerByPhone(phone);
    if (!customer) throw new Error('Cliente no encontrado.');

    const customerRef = doc(db, "customers", customer.id);

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
        transaction.update(customerRef, { points: newPoints });
    });

    return { ...customer, points: customer.points - pointsToRedeem };
};