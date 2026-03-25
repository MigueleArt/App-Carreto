import React from 'react';
import { PrinterIcon, CarretoPlusIcon } from '../Icons';

// --- Componente del Ticket de Venta ---
export const TicketModal = ({ receipt, onClose, onGoToHome }: any) => {
    const handlePrint = () => {
        alert('Simulando impresión del ticket...');
    };
    
    // Función dedicada para Nueva Venta
    const handleNewSale = () => {
        // Primero cerramos el ticket y limpiamos el carrito
        if (onClose) onClose();
        // Luego forzamos la navegación al HomeScreen
        if (onGoToHome) onGoToHome();
    };
    
    // Formatea la fecha para el ticket
    const formattedDate = receipt.date instanceof Date 
        ? receipt.date.toLocaleString('es-MX', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
          })
        : 'Fecha inválida';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm font-mono text-gray-800 dark:text-gray-200 text-sm">
                <div className="p-4 text-center border-b border-dashed border-gray-300 dark:border-gray-600">
                    <CarretoPlusIcon className="w-10 h-10 mx-auto text-emerald-500" />
                    <h2 className="text-xl font-bold mt-1">Carreto Plus</h2>
                    <p className="text-xs text-gray-500">Sistema de Recompensas</p>
                    <p className="text-xs mt-2">{formattedDate}</p>
                    <p className="text-xs">Folio: {receipt.folio}</p>
                </div>
                <div className="p-4 border-b border-dashed border-gray-300 dark:border-gray-600">
                     <p className="text-xs">Cliente: <span className="font-semibold">{receipt.customerName}</span></p>
                </div>
                <div className="p-4 max-h-48 overflow-y-auto space-y-1">
                    <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Producto</span>
                        <span>Importe</span>
                    </div>
                    {receipt.cart.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs">
                            <span className="truncate pr-2">{item.name}</span>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-1">
                    <div className="flex justify-between font-semibold text-xs">
                        <span>Subtotal:</span>
                        <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>
                     {receipt.discount > 0 && (
                        <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                            <span>Descuento ({receipt.redeemedPoints} Pts):</span>
                            <span>-${receipt.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-1 mt-1">
                        <span>TOTAL:</span>
                        <span>${receipt.total.toFixed(2)}</span>
                    </div>
                </div>
                 {/* Muestra resumen de puntos solo si hubo cliente */}
                 {receipt.customerId && (
                    <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600 text-xs space-y-1">
                          <h3 className="font-bold text-center mb-1">Resumen de Puntos</h3>
                          <div className="flex justify-between"><span>Saldo Anterior:</span><span>{receipt.points.before.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Puntos Canjeados:</span><span>-{receipt.points.redeemed.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Puntos Ganados:</span><span>+{receipt.points.earned.toLocaleString()}</span></div>
                          <div className="flex justify-between font-bold text-sm border-t border-gray-300 dark:border-gray-600 mt-1 pt-1"><span>Nuevo Saldo:</span><span>{receipt.points.after.toLocaleString()}</span></div>
                    </div>
                 )}
                <div className="p-3 flex gap-3">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        <PrinterIcon className="w-4 h-4" /> Imprimir
                    </button>
                    {/* Al hacer clic, ejecuta ambas acciones */}
                    <button onClick={handleNewSale} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Nueva Venta
                    </button>
                </div>
            </div>
            <style>{`
                .animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; }
                @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};