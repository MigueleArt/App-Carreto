// src/components/admin/sections/PriceAndProductSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getGasPrices, updateGasPrices, getProducts, addProduct, updateProduct } from '../../../services/adminService';
import ProductModal from '../modals/ProductModal';
import { ProductData } from '../../../types';
// Asumimos que los iconos se importan desde aquí
import { PlusIcon, PencilIcon, TrashIcon } from '../../Icons'; 

const PriceAndProductSection = ({ showNotification }: any) => {
    const [gasPrices, setGasPrices] = useState({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ prices: true, products: true, save: false });
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, prices: true, products: true }));
        try {
            const [prices, prods] = await Promise.all([getGasPrices(), getProducts()]);
            if (prices) setGasPrices(prices);
            setProducts(prods || []);
        } catch (error: any) {
            showNotification(`Error cargando datos: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, prices: false, products: false }));
        }
    }, [showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePriceChange = (e: any) => {
        const { name, value } = e.target;
        setGasPrices(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSavePrices = async () => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await updateGasPrices(gasPrices);
            showNotification('Precios actualizados.', 'success');
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleSaveProduct = async (productData: ProductData) => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            if (editingProduct && editingProduct.id) {
                await updateProduct(editingProduct.id, productData);
                showNotification('Producto actualizado.', 'success');
            } else {
                await addProduct(productData);
                showNotification('Producto agregado.', 'success');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchData();
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        // Usamos una notificación de confirmación en lugar de window.confirm
        const confirmed = window.confirm("¿Está seguro que desea desactivar este producto?");
        if (!confirmed) return;

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await updateProduct(productId, { isActive: false });
            showNotification('Producto desactivado.', 'success');
            fetchData();
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    return (
        <div className="animate-fade-in space-y-10">
            {isProductModalOpen && <ProductModal product={editingProduct} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} isLoading={isLoading.save} />}
            
            {/* ======================================= */}
            {/* SECCIÓN 1: PRECIOS DE COMBUSTIBLE */}
            {/* ======================================= */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tarifas de Combustible Globales</h2>
                <div className="p-6 border border-indigo-200 dark:border-indigo-900 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
                    {isLoading.prices ? <p className="text-center text-gray-500 py-4">Cargando precios...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['magnaPrice', 'premiumPrice', 'dieselPrice'].map(type => (
                                <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 capitalize">{type.replace('Price', '')}</label>
                                    <div className="relative mt-2">
                                        <span className="absolute left-3 top-2.5 text-2xl text-indigo-500 font-extrabold">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            name={type} 
                                            value={gasPrices[type as keyof typeof gasPrices]} 
                                            onChange={handlePriceChange} 
                                            className="w-full pl-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold text-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500 outline-none transition-shadow" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSavePrices} disabled={isLoading.save} className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 shadow-lg transition-all hover:shadow-indigo-500/50">
                            {isLoading.save ? 'Aplicando Cambios...' : 'Actualizar Precios'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ======================================= */}
            {/* SECCIÓN 2: CATÁLOGO DE PRODUCTOS */}
            {/* ======================================= */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Catálogo de Productos</h2>
                    <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-md transition-all">
                        <PlusIcon className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {products.length === 0 && !isLoading.products ? (
                        <p className="p-10 text-center text-gray-500">No hay productos en el catálogo.</p>
                    ) : isLoading.products ? (
                        <p className="p-10 text-center text-gray-500">Cargando catálogo...</p>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                            {products.map(prod => (
                                <div key={prod.id} className={`flex justify-between items-center p-4 transition-all ${prod.isActive ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'bg-red-50 dark:bg-red-900/20 opacity-80'}`}>
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${prod.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {prod.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{prod.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {prod.department && <span className="mr-2 text-xs text-indigo-500">{prod.department} |</span>}
                                                Código: {prod.barcode || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="font-extrabold text-lg text-emerald-600">${(prod.price || 0).toFixed(2)}</p>
                                            {!prod.isActive && <span className="text-xs text-red-500 font-semibold">INACTIVO</span>}
                                        </div>
                                        
                                        <div className="flex gap-1.5 ml-4">
                                            <button onClick={() => { setEditingProduct(prod); setIsProductModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar Producto">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            {prod.isActive && (
                                                <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Desactivar">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceAndProductSection;