import React, { useState, useMemo } from 'react';
// Asumimos que estos tipos y servicios existen y funcionan como antes
// import type { Customer, CartItem } from '../../types';
// import { findCustomerByPhone, addPoints } from '../../services/customerService';
// import { searchProducts } from '../../services/productService'; // Este buscaría en el Google Sheet
// import { processPaymentWithBanorte } from '../../services/banorteService';

// --- Iconos ---
const UserIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>;
const CameraIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 10.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" /><path fillRule="evenodd" d="M2.25 5.625A3.375 3.375 0 0 1 5.625 2.25h12.75c1.86 0 3.375 1.515 3.375 3.375v12.75a3.375 3.375 0 0 1-3.375 3.375H5.625a3.375 3.375 0 0 1-3.375-3.375V5.625Zm3.375-.75a1.875 1.875 0 0 0-1.875 1.875v12.75c0 1.036.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V5.625c0-1.036-.84-1.875-1.875-1.875H5.625Z" clipRule="evenodd" /></svg>;
const GasPumpIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M8.25 3.75a.75.75 0 0 1 .75.75v.75h3V4.5a.75.75 0 0 1 1.5 0v.75h.75a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25h-.75v.75a.75.75 0 0 1-1.5 0V15h-3v.75a.75.75 0 0 1-1.5 0V15h-.75a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25h.75v-.75a.75.75 0 0 1 .75-.75Zm0 1.5v.75H6a.75.75 0 0 0-.75.75v6.75c0 .414.336.75.75.75h.75v-.75a.75.75 0 0 1 1.5 0v.75h3v-.75a.75.75 0 0 1 1.5 0v.75h.75a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75h-.75v-.75a.75.75 0 0 1-1.5 0v.75h-3v-.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>;
const PrinterIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.25c0 1.036.84 1.875 1.875 1.875h.375A3.75 3.75 0 0 1 12 9.375h0a3.75 3.75 0 0 1 3.75-1.875h.375C17.16 7.5 18 6.66 18 5.625V3.375c0-1.035-.84-1.875-1.875-1.875H7.875ZM6 12.75A3.75 3.75 0 0 0 2.25 9v.003A3.75 3.75 0 0 0 6 12.75h12A3.75 3.75 0 0 0 21.75 9V9A3.75 3.75 0 0 0 18 12.75H6ZM12 14.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M3 12.75A2.25 2.25 0 0 1 .75 10.5v-.003A2.25 2.25 0 0 1 3 8.25h18A2.25 2.25 0 0 1 23.25 10.5v.003A2.25 2.25 0 0 1 21 12.75H3V12.75Zm0 4.5A2.25 2.25 0 0 1 .75 15v-.003A2.25 2.25 0 0 1 3 12.75h18A2.25 2.25 0 0 1 23.25 15v.003A2.25 2.25 0 0 1 21 17.25H3V17.25Z" /></svg>;
const CarretoPlusIcon = ({ className }) => <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25.8333 12.5V8.33333C25.8333 7.44928 25.4821 6.60143 24.8569 5.97631C24.2318 5.35119 23.384 5 22.5 5H10C9.11603 5 8.26818 5.35119 7.64306 5.97631C7.01794 6.60143 6.66667 7.44928 6.66667 8.33333V25C6.66667 25.884 7.01794 26.7319 7.64306 27.357C8.26818 27.9821 9.11603 28.3333 10 28.3333H14.1667" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.3333 35H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.3333 12.5H33.3333L36.6667 21.6667H18.3333V12.5Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.3333 21.6667H36.6667" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M22.5 28.3333C24.433 28.3333 26.0417 29.9419 26.0417 31.875C26.0417 33.8081 24.433 35.4167 22.5 35.4167C20.567 35.4167 18.9583 33.8081 18.9583 31.875C18.9583 29.9419 20.567 28.3333 22.5 28.3333Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M32.5 28.3333C34.433 28.3333 36.0417 29.9419 36.0417 31.875C36.0417 33.8081 34.433 35.4167 32.5 35.4167C30.567 35.4167 28.9583 33.8081 28.9583 31.875C28.9583 29.9419 30.567 28.3333 32.5 28.3333Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>


// --- NUEVO: Componente del Ticket de Venta ---
const TicketModal = ({ receipt, onClose }) => {
    const handlePrint = () => {
        alert('Simulando impresión del ticket...');
        // En una app real, aquí usarías window.print() o una librería de impresión.
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm font-mono text-gray-800 dark:text-gray-200">
                <div className="p-6 text-center border-b border-dashed border-gray-300 dark:border-gray-600">
                    <CarretoPlusIcon className="w-12 h-12 mx-auto text-emerald-500" />
                    <h2 className="text-2xl font-bold mt-2">Carreto Plus</h2>
                    <p className="text-sm text-gray-500">Sistema de Recompensas</p>
                    <p className="text-xs mt-4">{receipt.date.toLocaleString('es-MX')}</p>
                    <p className="text-xs">Folio: {receipt.folio}</p>
                </div>
                <div className="p-6 border-b border-dashed border-gray-300 dark:border-gray-600">
                     <p className="text-sm">Cliente: <span className="font-semibold">{receipt.customerName}</span></p>
                </div>
                <div className="p-6 text-sm space-y-2">
                    <div className="flex justify-between font-bold">
                        <span>Producto</span>
                        <span>Importe</span>
                    </div>
                    {receipt.cart.map(item => (
                        <div key={item.id} className="flex justify-between">
                            <span className="truncate pr-2">{item.name}</span>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                    <div className="flex justify-between font-semibold">
                        <span>Subtotal:</span>
                        <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>
                     {receipt.discount > 0 && (
                        <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                            <span>Descuento ({receipt.redeemedPoints} Pts):</span>
                            <span>-${receipt.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                        <span>TOTAL:</span>
                        <span>${receipt.total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="p-6 border-t border-dashed border-gray-300 dark:border-gray-600 text-sm space-y-2">
                     <h3 className="font-bold text-center mb-2">Resumen de Puntos</h3>
                     <div className="flex justify-between"><span>Saldo Anterior:</span><span>{receipt.points.before.toLocaleString()}</span></div>
                     <div className="flex justify-between"><span>Puntos Canjeados:</span><span>-{receipt.points.redeemed.toLocaleString()}</span></div>
                     <div className="flex justify-between"><span>Puntos Ganados:</span><span>+{receipt.points.earned.toLocaleString()}</span></div>
                     <div className="flex justify-between font-bold text-base border-t border-gray-300 dark:border-gray-600 mt-2 pt-2"><span>Nuevo Saldo:</span><span>{receipt.points.after.toLocaleString()}</span></div>
                </div>
                <div className="p-4 flex gap-4">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                        <PrinterIcon className="w-5 h-5" /> Imprimir
                    </button>
                    <button onClick={onClose} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Nueva Venta
                    </button>
                </div>
            </div>
        </div>
    );
};


// Componente principal del Punto de Venta
export default function POSScreen({ customer, onBack }) {
  // ESTADO DE LA VENTA ACTUAL
  const [cart, setCart] = useState([]); 
  const [internalCustomer, setInternalCustomer] = useState(customer); 
  const [redeemAmountInput, setRedeemAmountInput] = useState('');
  const [redeemedPoints, setRedeemedPoints] = useState(0); 

  // ESTADO DEL PANEL IZQUIERDO
  const [activeTab, setActiveTab] = useState('combustible'); 
  const [activeFuelType, setActiveFuelType] = useState('magna'); 
  const [gasAmount, setGasAmount] = useState('');
  const [productSearch, setProductSearch] = useState(''); 
  const [searchResults, setSearchResults] = useState([]);

  // ESTADO GENERAL
  const [isLoading, setIsLoading] = useState(false);
  const [saleReceipt, setSaleReceipt] = useState(null); // NUEVO: Estado para el ticket

  // PRECIOS (Estos vendrían de tu backend)
  const GAS_PRICES = {
    magna: 23.50,
    premium: 25.80,
    diesel: 24.90,
  };

  const gasLiters = useMemo(() => {
    const amount = parseFloat(gasAmount);
    const price = GAS_PRICES[activeFuelType] || 1;
    return isNaN(amount) ? 0 : amount / price;
  }, [gasAmount, activeFuelType, GAS_PRICES]);


  // CÁLCULOS DEL TICKET (PANEL DERECHO)
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  const discount = useMemo(() => redeemedPoints * 0.50, [redeemedPoints]); // Regla: 1 punto = $0.50
  const total = subtotal - discount;

  // --- LÓGICA DE LA APLICACIÓN ---
  
  const resetCart = () => {
      setCart([]);
      setRedeemedPoints(0);
      setRedeemAmountInput('');
      setGasAmount('');
      setProductSearch('');
      setSearchResults([]);
  };

  const handleCloseTicket = () => {
    setSaleReceipt(null);
    resetCart();
  };
  
  const handleAddGas = () => {
    const amount = parseFloat(gasAmount);
    if (isNaN(amount) || amount <= 0) return;
    const fuelName = activeFuelType.charAt(0).toUpperCase() + activeFuelType.slice(1);
    const newItem = {
      id: `gas-${Date.now()}`,
      name: `Gasolina ${fuelName} (${gasLiters.toFixed(2)} Lts)`,
      price: amount,
      type: 'combustible',
    };
    setCart(prev => [...prev, newItem]);
    setGasAmount('');
  };

  const handleAddProduct = (product) => {
    setCart(prev => [...prev, { ...product, id: `prod-${product.id}-${Date.now()}`, type: 'producto' }]);
  };
  
  const handleRemoveItem = (itemId) => {
      setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleApplyRedeemPoints = () => {
    const pointsToRedeem = parseInt(redeemAmountInput, 10);
    if (!internalCustomer || isNaN(pointsToRedeem) || pointsToRedeem < 0) {
        alert('Ingrese una cantidad válida de puntos.');
        return;
    }
    if (pointsToRedeem > internalCustomer.points) {
        alert('El cliente no tiene suficientes puntos.');
        return;
    }
    const maxDiscount = subtotal;
    if ((pointsToRedeem * 0.50) > maxDiscount) {
        alert('El descuento por puntos no puede ser mayor al subtotal de la venta.');
        return;
    }
    setRedeemedPoints(pointsToRedeem);
    alert(`${pointsToRedeem} puntos aplicados.`);
  };

  const handleProcessPayment = async () => {
    setIsLoading(true);
    try {
        const paymentSuccess = window.confirm(`Simular pago con Banorte por $${total.toFixed(2)}?`);

        if (paymentSuccess) {
            let pointsSummary = { before: 0, redeemed: 0, earned: 0, after: 0 };
            
            if (internalCustomer) {
                const pointsEarned = Math.floor(total / 10);
                const newPoints = internalCustomer.points - redeemedPoints + pointsEarned;
                
                pointsSummary = {
                    before: internalCustomer.points,
                    redeemed: redeemedPoints,
                    earned: pointsEarned,
                    after: newPoints
                };

                setInternalCustomer(prev => ({ ...prev, points: newPoints }));
                // await addPoints(internalCustomer.phone, total);
            }
            
            // Construir el objeto del ticket
            const receiptData = {
                folio: `SALE-${Date.now()}`,
                date: new Date(),
                customerName: internalCustomer ? internalCustomer.name : 'Público General',
                cart: [...cart],
                subtotal,
                discount,
                redeemedPoints,
                total,
                points: pointsSummary,
            };

            setSaleReceipt(receiptData);
            // La limpieza del carrito (resetCart) se moverá a la función handleCloseTicket
        } else {
            alert('Pago cancelado o fallido.');
        }
    } catch (error) {
        alert('Ocurrió un error durante el proceso de pago.');
        console.error(error);
    }
    setIsLoading(false);
  };
  
  // Simulación de búsqueda de productos
  const handleSearch = () => {
      if (!productSearch) { setSearchResults([]); return; }
      const fakeResults = [
          {id: 1, name: 'Aceite Mobil 1L', price: 150.00, barcode: '123'},
          {id: 2, name: 'Coca-Cola 600ml', price: 18.00, barcode: '456'},
          {id: 3, name: 'Papas Sabritas', price: 20.00, barcode: '789'}
      ].filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
      setSearchResults(fakeResults);
  };

  return (
    <>
      {saleReceipt && <TicketModal receipt={saleReceipt} onClose={handleCloseTicket} />}

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans justify-center">
        <div className="flex flex-col lg:flex-row w-full max-w-screen-2xl">
        
          {/* ================================================================= */}
          {/* ================= PANEL IZQUIERDO: CATÁLOGO =================== */}
          {/* ================================================================= */}
          <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col lg:min-h-[44rem]">
              {/* Pestañas */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('combustible')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'combustible' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Combustible</button>
                <button onClick={() => setActiveTab('productos')} className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'productos' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Productos</button>
              </div>

              {/* Contenido de Pestañas */}
              <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
                {activeTab === 'combustible' && (
                  <div className="animate-fade-in space-y-6">
                    <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">1. Seleccione el Tipo de Combustible</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setActiveFuelType('magna')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'magna' ? 'bg-green-100 dark:bg-green-900/50 border-green-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                            <GasPumpIcon className="w-8 h-8 text-green-600 dark:text-green-400"/>
                            <p className="mt-2 font-bold text-green-800 dark:text-green-300">Magna</p>
                        </button>
                        <button onClick={() => setActiveFuelType('premium')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'premium' ? 'bg-red-100 dark:bg-red-900/50 border-red-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                            <GasPumpIcon className="w-8 h-8 text-red-600 dark:text-red-400"/>
                            <p className="mt-2 font-bold text-red-800 dark:text-red-300">Premium</p>
                        </button>
                        <button onClick={() => setActiveFuelType('diesel')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${activeFuelType === 'diesel' ? 'bg-gray-200 dark:bg-gray-600 border-gray-500 scale-105' : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300'}`}>
                            <GasPumpIcon className="w-8 h-8 text-gray-800 dark:text-gray-300"/>
                            <p className="mt-2 font-bold text-gray-900 dark:text-gray-200">Diésel</p>
                        </button>
                    </div>

                    <div>
                      <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-200">2. Ingrese el Monto de Venta</h3>
                      <div className="mt-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Monto en pesos ($)</label>
                        <input
                          type="number"
                          value={gasAmount}
                          onChange={e => setGasAmount(e.target.value)}
                          placeholder="500.00"
                          className="w-full text-4xl font-bold p-3 mt-1 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
                        />
                        <p className="text-right mt-2 text-gray-500 dark:text-gray-400">Equivale a ~ <span className="font-bold text-emerald-500">{gasLiters.toFixed(2)} Litros</span></p>
                      </div>
                    </div>
                    <button onClick={handleAddGas} disabled={!gasAmount || parseFloat(gasAmount) <= 0} className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                      Agregar a la Venta
                    </button>
                  </div>
                )}

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
                     <div className="mt-4 space-y-2">
                         {searchResults.map(prod => (
                             <div key={prod.id} onClick={() => handleAddProduct(prod)} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/50 border border-gray-200 dark:border-gray-700">
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

          {/* ================================================================= */}
          {/* ================= PANEL DERECHO: TICKET DE VENTA ================ */}
          {/* ================================================================= */}
          <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col lg:min-h-[44rem]">
              {/* Sección de Cliente */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{internalCustomer.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{internalCustomer.points.toLocaleString()} Puntos Disponibles</p>
                        </div>
                        <button onClick={onBack} className="text-blue-500 hover:text-blue-700 font-semibold">Cambiar Cliente</button>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <input type="number" placeholder="Puntos a canjear" value={redeemAmountInput} onChange={(e) => setRedeemAmountInput(e.target.value)} className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-0"/>
                        <button onClick={handleApplyRedeemPoints} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0">Aplicar</button>
                    </div>
                 </div>
              </div>

              {/* Carrito de Compras */}
              <div className="flex-grow p-6 overflow-y-auto space-y-3">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Resumen de Venta</h3>
                 {cart.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">El carrito está vacío</p>}
                 {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center animate-fade-in">
                        <p className="text-gray-700 dark:text-gray-300 pr-2">{item.name}</p>
                        <div className="flex items-center gap-4">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">${item.price.toFixed(2)}</p>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 font-bold text-xl">×</button>
                        </div>
                    </div>
                 ))}
              </div>

              {/* Totales y Botón de Pago */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
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
                <button
                    onClick={handleProcessPayment}
                    disabled={isLoading || cart.length === 0}
                    className="w-full mt-4 bg-blue-600 text-white font-extrabold text-xl py-5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105"
                >
                  {isLoading ? 'Procesando...' : 'PAGAR CON TERMINAL BANORTE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
