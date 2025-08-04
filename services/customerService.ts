
import type { Customer } from '../types';
import { logTransactionToSheet } from './googleSheetsService';

// Mock database
let customers: Customer[] = [
  { id: 'a1b2c3d4', name: 'Juan Pérez', phone: '5512345678', points: 1250 },
  { id: 'e5f6g7h8', name: 'Ana García', phone: '5587654321', points: 340 },
  { id: 'i9j0k1l2', name: 'Cliente Frecuente', phone: '5555555555', points: 8500 },
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const findCustomerByPhone = async (phone: string): Promise<Customer | undefined> => {
  await simulateDelay(500);
  console.log(`Searching for customer with phone: ${phone}`);
  const customer = customers.find(c => c.phone === phone);
  console.log('Found customer:', customer);
  return customer;
};

export const registerCustomer = async (name: string, phone: string): Promise<Customer> => {
  await simulateDelay(700);
  if (customers.some(c => c.phone === phone)) {
    throw new Error('Este número de teléfono ya está registrado.');
  }
  const newCustomer: Customer = {
    id: Math.random().toString(36).substring(2, 10).toUpperCase(), // Generate random unique ID
    name,
    phone,
    points: 0,
  };
  customers.push(newCustomer);
  console.log('Registered new customer:', newCustomer);
  console.log('Current customer list:', customers);
  return newCustomer;
};

export const addPoints = async (phone: string, purchaseAmount: number): Promise<Customer> => {
    await simulateDelay(500);
    const customerIdx = customers.findIndex(c => c.phone === phone);
    if (customerIdx === -1) {
        throw new Error('Cliente no encontrado para agregar puntos.');
    }
    
    const customer = customers[customerIdx];
    // Rule: 1 point per $10 pesos
    const pointsToAdd = Math.floor(purchaseAmount / 10);
    customer.points += pointsToAdd;
    
    console.log(`Added ${pointsToAdd} points to ${customer.name}. New total: ${customer.points}`);

    // --- Google Sheets Integration ---
    try {
      await logTransactionToSheet({
        customerId: customer.id,
        phone: customer.phone,
        purchaseDate: new Date().toLocaleDateString('es-MX'),
        purchaseAmount: purchaseAmount,
        pointsAccumulated: pointsToAdd
      });
    } catch (error) {
      // Log the error but don't block the user flow
      console.error("Failed to log transaction to Google Sheets:", error);
    }
    // --- End Integration ---

    const updatedCustomer = { ...customer };
    customers[customerIdx] = updatedCustomer;
    return updatedCustomer;
};

export const redeemPoints = async (phone: string, pointsToRedeem: number): Promise<Customer> => {
    await simulateDelay(500);
    const customerIdx = customers.findIndex(c => c.phone === phone);
     if (customerIdx === -1) {
        throw new Error('Cliente no encontrado para canjear puntos.');
    }

    const customer = customers[customerIdx];
    if (customer.points < pointsToRedeem) {
        throw new Error('Puntos insuficientes.');
    }
    customer.points -= pointsToRedeem;
    console.log(`Redeemed ${pointsToRedeem} points from ${customer.name}. New total: ${customer.points}`);
    
    const updatedCustomer = { ...customer };
    customers[customerIdx] = updatedCustomer;
    return updatedCustomer;
};
