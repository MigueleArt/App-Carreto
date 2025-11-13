import React from 'react';
import { PrinterIcon, CarretoPlusIcon } from '../Icons';

// --- Componente del Ticket de Venta ---
export const TicketModal = ({ receipt, onClose }) => {
    const handlePrint = () => {
        alert('Simulando impresión del ticket...');
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm font-mono text-gray-800 dark:text-gray-200 text-sm"> {/* Ajustado tamaño de fuente base */}
                <div className="p-4 text-center border-b border-dashed border-gray-300 dark:border-gray-600"> {/* Reducido padding */}
                    <CarretoPlusIcon className="w-10 h-10 mx-auto text-emerald-500" /> {/* Reducido tamaño ícono */}
                    <h2 className="text-xl font-bold mt-1">Carreto Plus</h2> {/* Reducido tamaño y margen */}
                    <p className="text-xs text-gray-500">Sistema de Recompensas</p>
                    <p className="text-xs mt-2">{formattedDate}</p> {/* Usando fecha formateada */}
                    <p className="text-xs">Folio: {receipt.folio}</p>
                </div>
                <div className="p-4 border-b border-dashed border-gray-300 dark:border-gray-600">
                     <p className="text-xs">Cliente: <span className="font-semibold">{receipt.customerName}</span></p> {/* Reducido tamaño fuente */}
                </div>
                <div className="p-4 max-h-48 overflow-y-auto space-y-1"> {/* Reducido padding y añadido scroll */}
                    <div className="flex justify-between font-bold text-xs mb-1"> {/* Reducido tamaño y margen */}
                        <span>Producto</span>
                        <span>Importe</span>
                    </div>
                    {receipt.cart.map(item => (
                        <div key={item.id} className="flex justify-between text-xs"> {/* Reducido tamaño fuente */}
                            <span className="truncate pr-2">{item.name}</span>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-1"> {/* Reducido padding */}
                    <div className="flex justify-between font-semibold text-xs"> {/* Reducido tamaño fuente */}
                        <span>Subtotal:</span>
                        <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>
                     {receipt.discount > 0 && (
                        <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 text-xs"> {/* Reducido tamaño fuente */}
                            <span>Descuento ({receipt.redeemedPoints} Pts):</span>
                            <span>-${receipt.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-1 mt-1"> {/* Reducido tamaño, padding y margen */}
                        <span>TOTAL:</span>
                        <span>${receipt.total.toFixed(2)}</span>
                    </div>
                </div>
                 {/* Muestra resumen de puntos solo si hubo cliente */}
                 {receipt.customerId && (
                    <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600 text-xs space-y-1"> {/* Reducido tamaño fuente */}
                          <h3 className="font-bold text-center mb-1">Resumen de Puntos</h3> {/* Reducido margen */}
                          <div className="flex justify-between"><span>Saldo Anterior:</span><span>{receipt.points.before.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Puntos Canjeados:</span><span>-{receipt.points.redeemed.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Puntos Ganados:</span><span>+{receipt.points.earned.toLocaleString()}</span></div>
                          <div className="flex justify-between font-bold text-sm border-t border-gray-300 dark:border-gray-600 mt-1 pt-1"><span>Nuevo Saldo:</span><span>{receipt.points.after.toLocaleString()}</span></div> {/* Reducido tamaño, margen y padding */}
                    </div>
                 )}
                <div className="p-3 flex gap-3"> {/* Reducido padding y gap */}
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"> {/* Reducido padding y tamaño fuente */}
                        <PrinterIcon className="w-4 h-4" /> Imprimir
                    </button>
                    <button onClick={onClose} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"> {/* Reducido padding y tamaño fuente */}
                        Nueva Venta
                    </button>
                </div>
            </div>
            {/* Estilo para animación fade-in (opcional, añadir a tu CSS global si no lo tienes) */}
            <style>{`
                .animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; }
                @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};