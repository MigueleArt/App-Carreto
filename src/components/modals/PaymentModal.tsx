import React from 'react';

// --- Iconos (puedes moverlos a Icons.tsx si quieres) ---
const MoneyIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.25 12.75c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75c0-.414-.336-.75-.75-.75h-.01a.75.75 0 00-.75.75zM11.25 15.75c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75c0-.414-.336-.75-.75-.75h-.01a.75.75 0 00-.75.75z" /><path fillRule="evenodd" d="M1.5 6a3 3 0 013-3h15a3 3 0 013 3v12a3 3 0 01-3 3H4.5a3 3 0 01-3-3V6zm6 7.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15 13.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM17.25 15a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM17.25 12a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM9.75 15a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM9.75 12a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM7.5 15a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM7.5 12a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01z" clipRule="evenodd" /></svg>;
const CreditCardIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zM4.5 6.75h15v2.25h-15V6.75zM4.5 12h15v5.25h-15V12z" /><path d="M6 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
const StarIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433L10.788 3.21z" clipRule="evenodd" /></svg>;

// Definimos los tipos de métodos de pago
type PaymentMethod = 'efectivo' | 'terminal' | 'puntos';

interface PaymentModalProps {
  total: number;
  customer: any; // El cliente actual
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
  isLoading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  total, 
  customer, 
  onClose, 
  onConfirm, 
  isLoading 
}) => {

  // Lógica para Pagar con Puntos
  // 1 punto = $0.50 pesos, así que necesitamos 2 puntos por cada $1 peso.
  const pointsNeededForPayment = total * 2;
  const canPayWithPoints = customer && total > 0 && customer.points >= pointsNeededForPayment;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
        {/* Contenedor del Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            
            {/* Encabezado */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Confirmar Pago</h2>
                <button 
                    onClick={onClose} 
                    disabled={isLoading}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Cuerpo y Total */}
            <div className="p-6">
                <p className="text-center text-gray-600 dark:text-gray-400">Total a Pagar:</p>
                <p className="text-center text-6xl font-extrabold text-emerald-500 mb-6">
                    ${total.toFixed(2)}
                </p>

                {/* --- Botones de Pago --- */}
                <div className="space-y-3">
                    {/* Botón 1: Pagar con Puntos */}
                    <button
                        onClick={() => onConfirm('puntos')}
                        disabled={!canPayWithPoints || isLoading} 
                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white font-extrabold text-xl py-5 px-6 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-transform transform hover:scale-[1.03] shadow-lg disabled:shadow-none disabled:transform-none"
                    >
                        <StarIcon className="w-6 h-6" />
                        {isLoading ? 'Procesando...' : `Pagar con ${pointsNeededForPayment.toLocaleString()} Puntos`}
                    </button>

                    {/* Botón 2: Pagar con Terminal */}
                    <button
                        onClick={() => onConfirm('terminal')}
                        disabled={isLoading || total < 0} 
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-extrabold text-xl py-5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-[1.03] shadow-lg"
                    >
                        <CreditCardIcon className="w-6 h-6" />
                        {isLoading ? 'Procesando...' : 'Pagar con Terminal'}
                    </button>

                    {/* Botón 3: Pagar con Efectivo */}
                    <button
                        onClick={() => onConfirm('efectivo')}
                        disabled={isLoading || total < 0} 
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-extrabold text-xl py-5 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-transform transform hover:scale-[1.03] shadow-lg"
                    >
                        <MoneyIcon className="w-6 h-6" />
                        {isLoading ? 'Procesando...' : 'Pagar en Efectivo'}
                    </button>
                </div>
            </div>

            {/* Pie de página (Botón Cancelar) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-right">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
        </div>
        {/* Estilo para animación (puedes moverlo a tu CSS global) */}
        <style>{`
            .animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; }
            @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
};