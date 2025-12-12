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
                <div className="animate-fade-in">
                    {/* Tarjeta con diseño mejorado */}
                    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        
                        {/* Decoración de fondo sutil */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full opacity-5 blur-2xl pointer-events-none"></div>

                        {/* Encabezado: Nombre y Botón Cambiar */}
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Cliente Frecuente</span>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 leading-tight">{customer.name}</h3>
                            </div>
                            <button 
                                onClick={onBack} 
                                className="text-xs bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 border border-gray-200 dark:border-gray-600 font-medium py-1.5 px-3 rounded-lg transition-colors shadow-sm"
                            >
                                Cambiar
                            </button>
                        </div>

                        {/* --- PUNTOS DESTACADOS --- */}
                        <div className="flex flex-col items-center justify-center py-3 relative z-10">
                            <div className="flex items-center gap-2">

                                {/* Número de Puntos Grande */}
                                <span className="text-5xl font-black text-gray-800 dark:text-white tracking-tighter">
                                    {customer.points.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-400 mt-1">Puntos Disponibles</p>
                        </div>

                        {/* Input de Canje (Integrado visualmente) */}
                        {customer.points > 0 && ( 
                            <div className="mt-4 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600 flex gap-2 shadow-sm relative z-10">
                                <input 
                                    type="number" 
                                    placeholder={`Max ${Math.min(customer.points, Math.floor(customer.points))}`} 
                                    value={redeemAmountInput} 
                                    onChange={(e) => setRedeemAmountInput(e.target.value)} 
                                    className="flex-grow bg-transparent px-3 py-2 text-gray-800 dark:text-gray-100 font-bold placeholder-gray-400 outline-none w-full"
                                    max={customer.points}
                                    min="0"
                                    disabled={isLoading}
                                />
                                <button 
                                    onClick={handleApplyClick} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-5 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                                    disabled={!redeemAmountInput || parseInt(redeemAmountInput, 10) < 0 || isLoading}
                                >
                                    Aplicar
                                </button>
                            </div>
                        )}
                    </div>
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
                                className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 bg-red-100 dark:bg-red-800/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700 transition-colors shadow-sm"
                                aria-label="Eliminar item"
                                disabled={isLoading}
                            >
                                {/* Usamos un SVG en lugar de texto para un centrado perfecto */}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth={2.5} 
                                    stroke="currentColor" 
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
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