import React, { useState, useEffect } from 'react';

// YA NO NECESITAMOS LOS ICONOS DE PAGO AQUÍ

// Definimos los props
interface CartPanelProps {
  customer: any;
  cart: any[];
  subtotal: number;
  discount: number;
  total: number;
  redeemedPoints: number;
  onRemoveItem: (itemId: string) => void;
  onApplyPoints: (points: number) => void;
  onShowPaymentOptions: () => void; // <--- CAMBIO DE PROP
  onBack: () => void;
  isLoading: boolean;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  customer,
  cart,
  subtotal,
  discount,
  total,
  redeemedPoints,
  onRemoveItem,
  onApplyPoints,
  onShowPaymentOptions, // <--- CAMBIO DE PROP
  onBack,
  isLoading
}) => {
  
  // (La lógica del redeemAmountInput no cambia)
  const [redeemAmountInput, setRedeemAmountInput] = useState('');

  const handleApplyClick = () => {
    const points = parseInt(redeemAmountInput, 10);
    if (!isNaN(points) && points >= 0) {
      onApplyPoints(points);
    }
  };

  useEffect(() => {
    if (redeemedPoints === 0) {
      setRedeemAmountInput('');
    }
  }, [redeemedPoints]);

  return (
    <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col lg:min-h-[44rem]">
            {/* Sección de Cliente (Sin cambios) */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              {/* ...toda la lógica de la tarjeta de cliente no cambia... */}
                <div className="animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg text-blue-900 dark:text-blue-100">{customer.name}</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{customer.points.toLocaleString()} Puntos Disponibles</p>
                            </div>
                            <button 
                                onClick={onBack} 
                                className="bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-sm font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                            >
                                Cambiar
                            </button>
                        </div>
                    </div>
                    {customer.points > 0 && ( 
                        <div className="flex gap-2 mt-4">
                            <input 
                                type="number" 
                                placeholder={`Max ${Math.min(customer.points, Math.floor(subtotal / 0.50))}`} 
                                value={redeemAmountInput} 
                                onChange={(e) => setRedeemAmountInput(e.target.value)} 
                                className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-0 border border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                max={customer.points}
                                min="0"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleApplyClick} 
                                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0 disabled:bg-gray-400 shadow-sm hover:shadow-md"
                                disabled={!redeemAmountInput || parseInt(redeemAmountInput, 10) < 0 || isLoading}
                            >
                                Aplicar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Carrito de Compras (Sin cambios) */}
            <div className="flex-grow p-6 overflow-y-auto space-y-3">
              {/* ...toda la lógica del carrito no cambia... */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Resumen de Venta</h3>
                {cart.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">El carrito está vacío</p>
                )}
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg shadow-sm animate-fade-in">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 pr-2 truncate">{item.name}</p>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">${item.price.toFixed(2)}</p>
                            <button 
                                onClick={() => onRemoveItem(item.id)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 bg-red-100 dark:bg-red-800/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                                aria-label="Eliminar item"
                                disabled={isLoading}
                            >
                                <span className="font-bold text-xl leading-none">×</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- SECCIÓN DE PAGO (AQUÍ ESTÁ EL CAMBIO) --- */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {/* Resumen de totales (Sin cambios) */}
                <div className="flex justify-between text-lg">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-lg text-emerald-600 dark:text-emerald-400">
                        <span>Descuento ({redeemedPoints} Puntos):</span>
                        <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-3xl font-bold border-t pt-4 border-gray-200 dark:border-gray-700">
                    <span className="text-gray-800 dark:text-gray-100">TOTAL:</span>
                    <span className="text-emerald-500">${total.toFixed(2)}</span>
                </div>

                {/* --- Botón de Pago Único --- */}
                <button
                    onClick={onShowPaymentOptions} // <-- CAMBIO DE FUNCIÓN
                    disabled={isLoading || cart.length === 0 || total < 0} 
                    className="w-full mt-4 bg-blue-600 text-white font-extrabold text-xl py-5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-[1.03] shadow-lg hover:shadow-blue-500/30"
                >
                    {/* El texto ya no cambia con isLoading, porque el modal lo manejará */}
                    Proceder al Pago
                </button>
            </div>
        </div>
    </div>
  );
};