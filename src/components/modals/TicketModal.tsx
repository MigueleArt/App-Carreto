import React from 'react';
import { PrinterIcon, CarretoPlusIcon } from '../Icons';

export const TicketModal = ({ receipt, onClose, onGoToHome, onChangeCustomer }: any) => {

    const handlePrint = () => {
        alert('Simulando impresión del ticket...');
    };

    const handleNewSale = () => {
        if (onClose) onClose();
        if (onGoToHome) onGoToHome();
    };

    const formattedDate = receipt.date instanceof Date
        ? receipt.date.toLocaleString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
        : 'Fecha inválida';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast">
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm font-mono text-gray-800 dark:text-gray-200 text-sm relative">

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="p-4 text-center border-b border-dashed border-gray-300 dark:border-gray-600">
                    <CarretoPlusIcon className="w-10 h-10 mx-auto text-emerald-500" />
                    <h2 className="text-xl font-bold mt-1">Carreto Plus</h2>
                    <p className="text-xs text-gray-500">Sistema de Recompensas</p>
                    <p className="text-xs mt-2">{formattedDate}</p>
                    <p className="text-xs">Folio: {receipt.folio}</p>
                </div>

                {/* Cliente */}
                <div className="p-4 border-b border-dashed border-gray-300 dark:border-gray-600">
                    <p className="text-xs">
                        Cliente: <span className="font-semibold">{receipt.customerName}</span>
                    </p>
                </div>

                {/* Productos */}
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

                {/* Totales */}
                <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-1">
                    <div className="flex justify-between font-semibold text-xs">
                        <span>Subtotal:</span>
                        <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>

                    {receipt.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 text-xs">
                            <span>Descuento ({receipt.redeemedPoints} Pts):</span>
                            <span>-${receipt.discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-lg font-bold border-t pt-1 mt-1">
                        <span>TOTAL:</span>
                        <span>${receipt.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Puntos */}
                {receipt.customerId && (
                    <div className="p-4 border-t border-dashed text-xs space-y-1">
                        <h3 className="font-bold text-center mb-1">Resumen de Puntos</h3>
                        <div className="flex justify-between"><span>Saldo Anterior:</span><span>{receipt.points.before}</span></div>
                        <div className="flex justify-between"><span>Canjeados:</span><span>-{receipt.points.redeemed}</span></div>
                        <div className="flex justify-between"><span>Ganados:</span><span>+{receipt.points.earned}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1">
                            <span>Nuevo Saldo:</span><span>{receipt.points.after}</span>
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="p-4 space-y-2">

                    {/* Nueva Venta */}
                    <button
                        onClick={handleNewSale}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg"
                    >
                        Nueva Venta
                    </button>

                    {/* Siguiente Cliente */}
                    <button
                        onClick={onChangeCustomer || onClose}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                    >
                        Siguiente Cliente
                    </button>

                    {/* Imprimir */}
                    <button
                        onClick={handlePrint}
                        className="w-full bg-gray-200 py-2 rounded-lg"
                    >
                        <PrinterIcon className="w-4 h-4 inline" /> Imprimir
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