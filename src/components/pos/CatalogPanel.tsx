import React, { useState, useMemo, useEffect } from 'react';
import { GasPumpIcon, CameraIcon } from '../Icons'; 
import { searchProducts } from '../../services/productService';
import { getGasPrices } from '../../services/adminService';

// Icono simple para el botón de intercambio
const SwapIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

interface CatalogPanelProps {
  onAddGas: (item: any) => void;
  onAddProduct: (item: any) => void;
  showNotification: (message: string, type: string) => void;
}

export const CatalogPanel: React.FC<CatalogPanelProps> = ({ 
  onAddGas, 
  onAddProduct, 
  showNotification 
}) => {
  
  // --- Estados ---
  const [activeTab, setActiveTab] = useState('combustible');
  const [activeFuelType, setActiveFuelType] = useState('magna');
  const [gasAmount, setGasAmount] = useState('');
  
  // Estado para alternar entre Pesos y Litros
  const [inputMode, setInputMode] = useState<'pesos' | 'litros'>('pesos');

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [gasPrices, setGasPrices] = useState({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
  const [pricesLoading, setPricesLoading] = useState(true);

  // --- Carga de Precios ---
  useEffect(() => {
    const fetchGasPrices = async () => {
        setPricesLoading(true); 
        try {
            const fetchedPrices = await getGasPrices(); 
            if (fetchedPrices) {
                setGasPrices({
                    magnaPrice: fetchedPrices.magnaPrice || 0,
                    premiumPrice: fetchedPrices.premiumPrice || 0,
                    dieselPrice: fetchedPrices.dieselPrice || 0,
                });
            } else {
                 showNotification('Error: No se encontró configuración de precios.', 'error');
            }
        } catch (error: any) {
            showNotification(`Error al cargar precios: ${error.message}`, 'error');
        } finally {
            setPricesLoading(false); 
        }
    };
    fetchGasPrices(); 
  }, [showNotification]); 

  // --- Cálculos Dinámicos ---
  
  // 1. Obtener precio actual
  const currentPrice = useMemo(() => {
      // @ts-ignore
      return gasPrices[`${activeFuelType}Price`] || 0;
  }, [gasPrices, activeFuelType]);

  // 2. Calcular la conversión para mostrarla debajo del input
  const conversionDisplay = useMemo(() => {
    const val = parseFloat(gasAmount);
    if (isNaN(val) || val <= 0 || currentPrice === 0) return null;

    if (inputMode === 'pesos') {
        // Input es Pesos -> Calculamos Litros
        const liters = val / currentPrice;
        return `Equivale a ~ ${liters.toFixed(2)} Litros`;
    } else {
        // Input es Litros -> Calculamos Costo
        const cost = val * currentPrice;
        return `Costo estimado: $${cost.toFixed(2)}`;
    }
   }, [gasAmount, currentPrice, inputMode]);

  // --- Handlers ---

  // Función para cambiar modo y limpiar input
  const toggleInputMode = () => {
      setInputMode(prev => prev === 'pesos' ? 'litros' : 'pesos');
      setGasAmount(''); 
  };

  const handleAddGasClick = () => {
    const amountVal = parseFloat(gasAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
        showNotification('Ingrese una cantidad válida.', 'error');
        return;
    }

    let finalPrice = 0;
    let finalLiters = 0;

    // Lógica para definir precio y litros finales según el modo
    if (inputMode === 'pesos') {
        finalPrice = amountVal;
        finalLiters = amountVal / currentPrice;
    } else {
        finalLiters = amountVal;
        finalPrice = amountVal * currentPrice;
    }

    const fuelName = activeFuelType.charAt(0).toUpperCase() + activeFuelType.slice(1);
    
    const newItem = {
      id: `gas-${Date.now()}`,
      name: `Gasolina ${fuelName} (${finalLiters.toFixed(2)} Lts)`,
      price: finalPrice, // El carrito siempre necesita el total en pesos
      type: 'combustible',
    };

    onAddGas(newItem);
    setGasAmount('');
  };

  const handleAddProductClick = (product: any) => {
    onAddProduct({ ...product, id: `prod-${product.id}-${Date.now()}`, type: 'producto' });
  };

  const handleSearch = async () => {
      if (!productSearch || productSearch.trim() === '') { 
          setSearchResults([]); 
          return; 
      }
      try {
        const results = await searchProducts(productSearch.trim()); 
        setSearchResults(results || []); 
      } catch (error: any) {
        showNotification(`Error: ${error.message}`, 'error');
        setSearchResults([]); 
      }
  };

  return (
    <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col lg:min-h-[44rem]">
            {/* Pestañas */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('combustible')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'combustible' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Combustible</button>
                <button onClick={() => setActiveTab('productos')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'productos' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Productos</button>
            </div>

            <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
                {/* --- PESTAÑA COMBUSTIBLE --- */}
                {activeTab === 'combustible' && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">1. Seleccione el Tipo de Combustible</h3>
                        
                        {pricesLoading ? <p className="text-gray-500 text-center py-4">Cargando precios...</p> : (
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'magna', label: 'Magna', color: 'green', price: gasPrices.magnaPrice },
                                    { id: 'premium', label: 'Premium', color: 'red', price: gasPrices.premiumPrice },
                                    { id: 'diesel', label: 'Diésel', color: 'gray', price: gasPrices.dieselPrice }
                                ].map(fuel => (
                                    <button 
                                        key={fuel.id}
                                        onClick={() => setActiveFuelType(fuel.id)} 
                                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all 
                                            ${activeFuelType === fuel.id 
                                                ? `bg-${fuel.color}-100 dark:bg-${fuel.color}-900/50 border-${fuel.color}-500 scale-105` 
                                                : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}
                                    >
                                        <GasPumpIcon className={`w-8 h-8 text-${fuel.color}-600 dark:text-${fuel.color}-400`}/>
                                        <p className={`mt-2 font-bold text-${fuel.color}-800 dark:text-${fuel.color}-300`}>{fuel.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">${fuel.price.toFixed(2)}/L</p> 
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* --- SECCIÓN 2 CON INTERCAMBIO --- */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">2. Ingrese Cantidad</h3>
                                
                                {/* BOTÓN DE CAMBIO DE MODO - DISEÑO MEJORADO */}
                                <button 
                                    onClick={toggleInputMode}
                                    
                                    className="flex items-center gap-2 text-xs font-bold text-gray-200 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg border border-gray-600 transition-colors shadow-sm"
                                >
                                    <SwapIcon className="w-4 h-4 text-gray-300" />
                                    {inputMode === 'pesos' ? 'Cambiar a Litros' : 'Cambiar a Pesos'}
                                </button>
                            </div>

                            <div className="mt-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {inputMode === 'pesos' ? 'Monto en pesos ($)' : 'Cantidad en Litros (L)'}
                                </label>
                                <input
                                  type="number"
                                  value={gasAmount}
                                  onChange={e => setGasAmount(e.target.value)}
                                  placeholder="0.00" 
                                  className="w-full text-4xl font-bold p-3 mt-1 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
                                  disabled={pricesLoading}
                                />
                                {conversionDisplay && (
                                   <p className="text-right mt-2 text-gray-500 dark:text-gray-400">
                                       <span className="font-bold text-emerald-500">{conversionDisplay}</span>
                                   </p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={handleAddGasClick} 
                            disabled={pricesLoading || !gasAmount || parseFloat(gasAmount) <= 0} 
                            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {inputMode === 'pesos' ? 'Agregar Venta ($)' : 'Agregar Litros'}
                        </button>
                    </div>
                )}

                {/* --- PESTAÑA PRODUCTOS (Sin Cambios) --- */}
                {activeTab === 'productos' && (
                    <div className="animate-fade-in">
                        <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">Buscar Productos</h3>
                         <div className="flex gap-2 mt-4">
                            <input
                              type="text"
                              value={productSearch}
                              onChange={e => {setProductSearch(e.target.value); handleSearch();}} 
                              placeholder="Nombre o código de barras..."
                              className="flex-grow text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition min-w-0"
                            />
                            <button className="flex-shrink-0 flex items-center justify-center bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                              <CameraIcon className="w-6 h-6"/>
                            </button>
                         </div>
                         <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-2"> 
                            {searchResults.map(prod => (
                                <div key={prod.id} onClick={() => handleAddProductClick(prod)} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/50 border border-gray-200 dark:border-gray-700">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{prod.name}</span>
                                    <span className="font-bold text-emerald-500">${prod.price.toFixed(2)}</span>
                                </div>
                            ))}
                            {productSearch && searchResults.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No se encontraron productos.</p>
                            )}
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};