
import React, { useState, useCallback } from 'react';
import type { Customer } from '../../types';
import { addPoints, redeemPoints } from '../../services/customerService';
import { getSalesSuggestion } from '../../services/geminiService';
import ScannerModal from '../ScannerModal';

interface CustomerScreenProps {
  customer: Customer;
  onBack: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.315 7.584C10.596 6.303 12.686 6.303 13.966 7.584l.707.707a1.5 1.5 0 0 1 0 2.121l-.707.707a3 3 0 0 1-4.242 0l-.707-.707a1.5 1.5 0 0 1 0-2.121l.707-.707Zm-.707 5.657.707.707a3 3 0 0 0 4.242 0l.707-.707a1.5 1.5 0 0 0 0-2.121l-.707-.707a3 3 0 0 0-4.242 0l-.707.707a1.5 1.5 0 0 0 0 2.121ZM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-2.25a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z" clipRule="evenodd" />
    </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 10.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
      <path fillRule="evenodd" d="M2.25 5.625A3.375 3.375 0 0 1 5.625 2.25h12.75c1.86 0 3.375 1.515 3.375 3.375v12.75a3.375 3.375 0 0 1-3.375 3.375H5.625a3.375 3.375 0 0 1-3.375-3.375V5.625Zm3.375-.75a1.875 1.875 0 0 0-1.875 1.875v12.75c0 1.036.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V5.625c0-1.036-.84-1.875-1.875-1.875H5.625Z" clipRule="evenodd" />
    </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2.01A10.03 10.03 0 0 0 2.01 12.04a10.03 10.03 0 0 0 10.03 10.03 10.03 10.03 0 0 0 10.03-10.03A10.03 10.03 0 0 0 12.04 2.01zM16.82 15.24c-.2-.1-1.25-.62-1.44-.69-.2-.07-.34-.07-.48.07-.14.14-.54.69-.67.83-.12.14-.24.16-.45.05-.2-.1-.86-.31-1.64-1-.6-.55-1-1.23-1.12-1.44s0-.31.07-.41c.1-.1.21-.24.32-.36.1-.1.16-.21.24-.36.08-.14.04-.28 0-.38-.05-.1-1.13-2.7-1.3-3.22-.17-.52-.34-.45-.48-.45h-.41c-.14 0-.35.03-.52.24-.18.2-.67.65-.67 1.58 0 .92.68 1.84.78 1.98.1.14 1.34 2.04 3.28 2.87.46.2.82.31 1.1.4.45.12.86.1 1.18-.08.38-.17 1.13-.46 1.29-.9.16-.43.16-.8.1-.9.07-.1-.14-.24-.34-.34z" />
    </svg>
);


export default function CustomerScreen({ customer, onBack, showNotification }: CustomerScreenProps): React.ReactNode {
  const [internalCustomer, setInternalCustomer] = useState<Customer>(customer);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState({ points: false, redeem: false, suggestion: false });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const handleAddPoints = async () => {
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Ingrese un monto de compra válido.', 'error');
      return;
    }
    setIsLoading(prev => ({ ...prev, points: true }));
    try {
      const updatedCustomer = await addPoints(internalCustomer.phone, amount);
      const pointsAdded = updatedCustomer.points - internalCustomer.points;
      setInternalCustomer(updatedCustomer);
      showNotification(`Se agregaron ${pointsAdded} puntos.`, 'success');
      setPurchaseAmount('');
      setSuggestion('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(errorMessage, 'error');
    }
    setIsLoading(prev => ({ ...prev, points: false }));
  };

  const handleRedeemPoints = async () => {
    const amount = parseInt(redeemAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Ingrese una cantidad de puntos válida.', 'error');
      return;
    }
    setIsLoading(prev => ({ ...prev, redeem: true }));
    try {
      const updatedCustomer = await redeemPoints(internalCustomer.phone, amount);
      setInternalCustomer(updatedCustomer);
      showNotification(`${amount} puntos canjeados con éxito.`, 'success');
      setRedeemAmount('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(errorMessage, 'error');
    }
    setIsLoading(prev => ({ ...prev, redeem: false }));
  };

  const handleGetSuggestion = useCallback(async () => {
    const amount = parseFloat(purchaseAmount) || 0;
    setIsLoading(prev => ({...prev, suggestion: true}));
    setSuggestion('');
    try {
        const result = await getSalesSuggestion(internalCustomer, amount);
        setSuggestion(result);
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        showNotification(errorMessage, 'error');
    }
    setIsLoading(prev => ({...prev, suggestion: false}));
  }, [internalCustomer, purchaseAmount, showNotification]);

  const handleScanSuccess = (scannedAmount: number) => {
    setPurchaseAmount(scannedAmount.toFixed(2));
    setIsScannerOpen(false);
    showNotification(`Ticket escaneado por $${scannedAmount.toFixed(2)}. Presione 'Agregar Puntos' para confirmar.`, 'info');
  };

  const handleSendWhatsApp = () => {
    const name = internalCustomer.name.split(' ')[0];
    const points = internalCustomer.points;
    const phone = `52${internalCustomer.phone}`; // Add Mexico country code

    const message = `Hola ${name}, gracias por ser parte de Carreto Plus. Tus puntos actuales son: ${points.toLocaleString()}. ¡Te esperamos pronto!`;
    const encodedMessage = encodeURIComponent(message);

    const url = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    showNotification('Abriendo WhatsApp para enviar el resumen de puntos.', 'info');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{internalCustomer.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{internalCustomer.phone}</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-3xl font-bold text-emerald-500">{internalCustomer.points.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Puntos</p>
            </div>
        </div>

        <div className="space-y-6 mt-8">
            {/* Add Points Section */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Acumular Puntos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingrese el monto o escanee el ticket de compra (1 punto por cada $10).</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input
                            type="number"
                            value={purchaseAmount}
                            onChange={e => setPurchaseAmount(e.target.value)}
                            placeholder="Monto"
                            className="w-full text-lg p-3 pl-8 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
                        />
                    </div>
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                        aria-label="Escanear ticket de compra"
                    >
                        <CameraIcon className="w-5 h-5"/>
                        Escanear
                    </button>
                </div>
                <button onClick={handleAddPoints} disabled={isLoading.points || !purchaseAmount} className="w-full mt-4 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors">
                    {isLoading.points ? 'Agregando...' : 'Agregar Puntos'}
                </button>
            </div>

            {/* AI Suggestion Section */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Asistente de Ventas IA</h3>
                 <button onClick={handleGetSuggestion} disabled={isLoading.suggestion || !purchaseAmount} className="w-full mt-2 flex justify-center items-center gap-2 text-md font-semibold py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300">
                    <SparklesIcon className={`w-5 h-5 ${isLoading.suggestion ? 'animate-pulse' : ''}`}/>
                    {isLoading.suggestion ? 'Pensando...' : 'Obtener Sugerencia de Venta'}
                </button>
                {suggestion && (
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                        <p className="text-indigo-800 dark:text-indigo-200 text-center italic">"{suggestion}"</p>
                    </div>
                )}
            </div>

            {/* Communication Section */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Comunicación con Cliente</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Envía un resumen de sus puntos actuales directamente a su WhatsApp.</p>
                <button 
                    onClick={handleSendWhatsApp} 
                    className="w-full mt-2 flex justify-center items-center gap-3 text-md font-semibold py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                    <WhatsAppIcon className="w-6 h-6"/>
                    Enviar Resumen por WhatsApp
                </button>
            </div>

            {/* Redeem Points Section */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Canjear Puntos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingrese la cantidad de puntos a canjear por descuentos.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="number" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} placeholder="Puntos a canjear" className="flex-grow w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-blue-500 focus:border-blue-500 rounded-lg transition" />
                    <button onClick={handleRedeemPoints} disabled={isLoading.redeem || !redeemAmount} className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                        {isLoading.redeem ? 'Canjeando...' : 'Canjear Puntos'}
                    </button>
                </div>
            </div>
        </div>

        {isScannerOpen && (
            <ScannerModal
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
                showNotification={showNotification}
            />
        )}
    </div>
  );
}
