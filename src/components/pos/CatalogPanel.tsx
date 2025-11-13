import React, { useState, useMemo, useEffect } from 'react';
import { GasPumpIcon, CameraIcon } from '../Icons'; // Importa tus iconos
import { searchProducts } from '../../services/productService';
import { getGasPrices } from '../../services/adminService';

// Definimos los props que este panel necesitará
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
  
  // --- Estados propios de este panel ---
  const [activeTab, setActiveTab] = useState('combustible');
  const [activeFuelType, setActiveFuelType] = useState('magna');
  const [gasAmount, setGasAmount] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [gasPrices, setGasPrices] = useState({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
  const [pricesLoading, setPricesLoading] = useState(true);

  // --- Carga de Precios de Gasolina (Lógica que se queda aquí) ---
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
                 showNotification('Error: No se encontró el documento de configuración de precios.', 'error');
                 setGasPrices({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
            }
        } catch (error) {
            showNotification(`Error al cargar precios de gasolina: ${error.message}`, 'error');
            setGasPrices({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
        } finally {
            setPricesLoading(false); 
        }
    };
    fetchGasPrices(); 
  }, [showNotification]); 

  // --- Cálculos (Lógica que se queda aquí) ---
  const gasLiters = useMemo(() => {
    const amount = parseFloat(gasAmount);
    const price = gasPrices[`${activeFuelType}Price`] || 1;
    return isNaN(amount) || price === 0 ? 0 : amount / price;
   }, [gasAmount, activeFuelType, gasPrices]);

  // --- Handlers (Lógica que se queda aquí) ---
  const handleAddGasClick = () => {
    const amount = parseFloat(gasAmount);
    if (isNaN(amount) || amount <= 0) {
        showNotification('Ingrese un monto válido para agregar combustible.', 'error');
        return;
    }
    const fuelName = activeFuelType.charAt(0).toUpperCase() + activeFuelType.slice(1);
    const newItem = {
      id: `gas-${Date.now()}`,
      name: `Gasolina ${fuelName} (${gasLiters.toFixed(2)} Lts)`,
      price: amount,
      type: 'combustible',
    };
    // En lugar de setCart, llama al prop:
    onAddGas(newItem);
    setGasAmount('');
  };

  const handleAddProductClick = (product) => {
    // En lugar de setCart, llama al prop:
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
      } catch (error) {
        showNotification(`Error al buscar productos: ${error.message}`, 'error');
        setSearchResults([]); 
      }
  };

  return (
    <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col">
        {/* Caja blanca/oscura del panel */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col lg:min-h-[44rem]">
            {/* Pestañas (Combustible / Productos) */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('combustible')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'combustible' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Combustible</button>
                <button onClick={() => setActiveTab('productos')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'productos' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Productos</button>
            </div>

            {/* Contenido dinámico según la pestaña activa */}
            <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
                {/* Contenido Pestaña Combustible */}
                {activeTab === 'combustible' && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">1. Seleccione el Tipo de Combustible</h3>
                        {/* Muestra indicador de carga o los botones */}
                        {pricesLoading ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">Cargando precios...</p> : (
                            <div className="grid grid-cols-3 gap-3">
                                {/* Botón Magna */}
                                <button onClick={() => setActiveFuelType('magna')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'magna' ? 'bg-green-100 dark:bg-green-900/50 border-green-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                                    <GasPumpIcon className="w-8 h-8 text-green-600 dark:text-green-400"/>
                                    <p className="mt-2 font-bold text-green-800 dark:text-green-300">Magna</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">${gasPrices.magnaPrice.toFixed(2)}/L</p> 
                                </button>
                                {/* Botón Premium */}
                                <button onClick={() => setActiveFuelType('premium')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'premium' ? 'bg-red-100 dark:bg-red-900/50 border-red-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                                    <GasPumpIcon className="w-8 h-8 text-red-600 dark:text-red-400"/>
                                    <p className="mt-2 font-bold text-red-800 dark:text-red-300">Premium</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">${gasPrices.premiumPrice.toFixed(2)}/L</p> 
                                </button>
                                {/* Botón Diésel */}
                                <button onClick={() => setActiveFuelType('diesel')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'diesel' ? 'bg-gray-200 dark:bg-gray-600 border-gray-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                                    <GasPumpIcon className="w-8 h-8 text-gray-800 dark:text-gray-300"/>
                                    <p className="mt-2 font-bold text-gray-900 dark:text-gray-200">Diésel</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">${gasPrices.dieselPrice.toFixed(2)}/L</p> 
                                </button>
                            </div>
                        )}

                        {/* Sección para ingresar monto */}
                        <div>
                            <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">2. Ingrese el Monto de Venta</h3>
                            <div className="mt-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Monto en pesos ($)</label>
                                <input
                                  type="number"
                                  value={gasAmount}
                                  onChange={e => setGasAmount(e.target.value)}
                                  placeholder="0.00" 
                                  className="w-full text-4xl font-bold p-3 mt-1 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
                                  disabled={pricesLoading} // Deshabilita si los precios no han cargado
                                />
                                 {!pricesLoading && gasAmount && parseFloat(gasAmount) > 0 && (
                                    <p className="text-right mt-2 text-gray-500 dark:text-gray-400">Equivale a ~ <span className="font-bold text-emerald-500">{gasLiters.toFixed(2)} Litros</span></p>
                                 )}
                            </div>
                        </div>
                        {/* Botón para agregar combustible al carrito */}
                        <button 
                            onClick={handleAddGasClick} 
                            disabled={pricesLoading || !gasAmount || parseFloat(gasAmount) <= 0} 
                            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Agregar a la Venta
                        </button>
                    </div>
                )}

                {/* Contenido Pestaña Productos */}
                {activeTab === 'productos' && (
                    <div className="animate-fade-in">
                        <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">Buscar Productos</h3>
                         {/* Input de búsqueda y botón de escáner */}
                         <div className="flex gap-2 mt-4">
                            <input
                              type="text"
                              value={productSearch}
                              // Llama a handleSearch al cambiar el texto
                              onChange={e => {setProductSearch(e.target.value); handleSearch();}} 
                              placeholder="Nombre o código de barras..."
                              className="flex-grow text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition min-w-0"
                            />
                            <button className="flex-shrink-0 flex items-center justify-center bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                              <CameraIcon className="w-6 h-6"/> {/* TODO: Integrar escáner de productos */}
                            </button>
                         </div>
                         {/* Lista de resultados de búsqueda */}
                         <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-2"> 
                            {/* Mapea los resultados y muestra cada producto */}
                            {searchResults.map(prod => (
                                <div key={prod.id} onClick={() => handleAddProductClick(prod)} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/50 border border-gray-200 dark:border-gray-700">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{prod.name}</span>
                                    <span className="font-bold text-emerald-500">${prod.price.toFixed(2)}</span>
                                </div>
                            ))}
                            {/* Mensaje si no hay resultados */}
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