import { useState, useMemo } from 'react';

// Definimos el tipo de un item del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'combustible' | 'producto';
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  // Cálculos memorizados (se actualizan solos cuando cart o redeemedPoints cambian)
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  const discount = useMemo(() => redeemedPoints * 0.50, [redeemedPoints]);
  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  // Funciones para manipular el carrito
  const addItem = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Función para aplicar puntos con validaciones (robada de tu lógica original)
  const applyPoints = (pointsToRedeem: number, customerPoints: number) => {
    if (isNaN(pointsToRedeem) || pointsToRedeem < 0) {
        throw new Error('Ingrese una cantidad válida de puntos.');
    }
    if (pointsToRedeem > customerPoints) {
      throw new Error('El cliente no tiene suficientes puntos.');
    }
    
    const maxDiscountValue = subtotal;
    if ((pointsToRedeem * 0.50) > maxDiscountValue) {
      const maxPointsToRedeem = Math.floor(maxDiscountValue / 0.50);
      throw new Error(`El descuento excede el total. Máximo a canjear: ${maxPointsToRedeem} puntos.`);
    }

    setRedeemedPoints(pointsToRedeem);
    return true; // Éxito
  };

  const resetCart = () => {
    setCart([]);
    setRedeemedPoints(0);
  };

  // Exponemos el estado y las funciones
  return {
    cart,
    subtotal,
    discount,
    total,
    redeemedPoints,
    addItem,
    removeItem,
    applyPoints,
    resetCart,
  };
};