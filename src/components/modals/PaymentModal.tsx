import React from 'react';

// --- Iconos (SVG inline optimizados) ---
const MoneyIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" opacity="0.2"/><path d="M11.25 12.75c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75c0-.414-.336-.75-.75-.75h-.01a.75.75 0 00-.75.75zM11.25 15.75c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75c0-.414-.336-.75-.75-.75h-.01a.75.75 0 00-.75.75z" /><path fillRule="evenodd" d="M1.5 6a3 3 0 013-3h15a3 3 0 013 3v12a3 3 0 01-3 3H4.5a3 3 0 01-3-3V6zM6 13.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" clipRule="evenodd" /></svg>;
const CreditCardIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zM4.5 6.75h15v2.25h-15V6.75zM4.5 12h15v5.25h-15V12z" /><path d="M6 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
const StarIcon = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433L10.788 3.21z" clipRule="evenodd" /></svg>;

type PaymentMethod = 'efectivo' | 'terminal' | 'puntos';

interface PaymentModalProps {
  total: number;
  subtotal?: number;
  discount?: number;
  customer: any;
  cart: any[]; // <--- NUEVO: Recibimos el carrito para mostrar los items
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
  isLoading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  total,
  subtotal = total,
  discount = 0,
  customer, 
  cart = [], // Valor por defecto
  onClose, 
  onConfirm, 
  isLoading 
}) => {
  const pointsNeededForPayment = total * 2;
  const canPayWithPoints = customer && total > 0 && customer.points >= pointsNeededForPayment;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in-fast">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 shrink-0">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Confirmar Pedido</h2>
                <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="p-6 overflow-y-auto">
                
                {/* --- NUEVA SECCIÓN: LISTA DE ARTÍCULOS --- */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalle de Productos ({cart.length})</h3>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl max-h-40 overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="p-4 text-center text-sm text-gray-400">Sin productos</p>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-600 last:border-0 text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-gray-400 text-xs">#{index + 1}</span>
                                        <span className="text-gray-700 dark:text-gray-200 truncate font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap pl-2">
                                        ${item.price.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- RESUMEN FINANCIERO --- */}
                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-5 mb-8 border border-slate-100 dark:border-gray-600">
                    <p className="text-xs uppercase tracking-wide font-bold text-slate-400 mb-3">Totales</p>
                    
                    {discount > 0 && (
                        <div className="flex justify-between items-center mb-2 text-gray-500 dark:text-gray-400 text-sm">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                    )}
                    
                    {discount > 0 && (
                        <div className="flex justify-between items-center mb-2 text-emerald-600 dark:text-emerald-400 text-sm">
                            <span>Descuento aplicado</span>
                            <span>- ${discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end border-t border-slate-200 dark:border-gray-600 pt-3 mt-2">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total a Pagar</span>
                        <span className="text-4xl font-black text-emerald-500 tracking-tight">${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* --- SELECCIÓN DE MÉTODO --- */}
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 text-center">Seleccione método de pago:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Efectivo */}
                    <button
                        onClick={() => onConfirm('efectivo')}
                        disabled={isLoading}
                        className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 transition-all duration-200"
                    >
                        <div className="bg-emerald-100 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                             <MoneyIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="font-bold">Efectivo</span>
                    </button>

                    {/* Terminal */}
                    <button
                        onClick={() => onConfirm('terminal')}
                        disabled={isLoading}
                        className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 transition-all duration-200"
                    >
                        <div className="bg-blue-100 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                             <CreditCardIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="font-bold">Tarjeta / Terminal</span>
                    </button>

                    {/* Puntos */}
                    <button
                        onClick={() => onConfirm('puntos')}
                        disabled={!canPayWithPoints || isLoading}
                        className={`sm:col-span-2 group flex flex-row items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                            ${!canPayWithPoints 
                                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed grayscale' 
                                : 'border-yellow-200 hover:border-yellow-500 bg-yellow-50/50 hover:bg-yellow-50 text-yellow-700'
                            }`}
                    >
                        <StarIcon className="w-6 h-6 mb-0" />
                        <div className="text-left">
                            <span className="block font-bold leading-tight">Pagar con Puntos</span>
                            <span className="text-xs opacity-80">
                                {canPayWithPoints 
                                    ? `Requiere ${pointsNeededForPayment.toLocaleString()} pts` 
                                    : `Insuficientes (Tienes ${customer?.points || 0})`}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                <button onClick={onClose} disabled={isLoading} className="w-full py-3 text-gray-500 font-semibold hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    Cancelar transacción
                </button>
            </div>
        </div>
        <style>{`.animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};