import React, { useState, useEffect, useCallback } from 'react';
import { getGasPrices, updateGasPrices, getProducts, addProduct, updateProduct } from '../../../services/adminService';
import ProductModal from '../modals/ProductModal';
import { ProductData } from '../../../types';
// Asumimos que los iconos se importan desde aquí
import { PlusIcon, PencilIcon, TrashIcon } from '../../Icons';

const PriceAndProductSection = ({ showNotification }: any) => {
    // Cambiamos el estado inicial a strings para poder manejar correctamente la escritura del punto decimal (.)
    const [gasPrices, setGasPrices] = useState({ magnaPrice: '0', premiumPrice: '0', dieselPrice: '0' });
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ prices: true, products: true, save: false });
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

    // Estado para la confirmación de desactivación
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

    const fetchData = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, prices: true, products: true }));
        try {
            const [prices, prods] = await Promise.all([getGasPrices(), getProducts()]);
            if (prices) {
                // Aseguramos que se guarden como strings para que la edición sea fluida
                setGasPrices({
                    magnaPrice: String(prices.magnaPrice || 0),
                    premiumPrice: String(prices.premiumPrice || 0),
                    dieselPrice: String(prices.dieselPrice || 0)
                });
            }
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

        // 1. Eliminar cualquier caracter que no sea número (0-9) o punto (.)
        let sanitized = value.replace(/[^0-9.]/g, '');

        // 2. Prevenir que el usuario escriba más de un punto (ej. 22.5.3 -> 22.53)
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }

        setGasPrices(prev => ({ ...prev, [name]: sanitized }));
    };

    const handleSavePrices = async () => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            // Convertimos los strings a números reales antes de guardar en Firebase
            const parsedPrices = {
                magnaPrice: parseFloat(String(gasPrices.magnaPrice)) || 0,
                premiumPrice: parseFloat(String(gasPrices.premiumPrice)) || 0,
                dieselPrice: parseFloat(String(gasPrices.dieselPrice)) || 0
            };
            await updateGasPrices(parsedPrices);
            showNotification('Precios actualizados correctamente.', 'success');
        } catch (error: any) {
            showNotification(`Error al actualizar precios: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleSaveProduct = async (productData: ProductData) => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            if (editingProduct && editingProduct.id) {
                await updateProduct(editingProduct.id, productData);
                showNotification('Producto actualizado exitosamente.', 'success');
            } else {
                await addProduct(productData);
                showNotification('Nuevo producto agregado.', 'success');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchData();
        } catch (error: any) {
            showNotification(`Error al guardar producto: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    // PREPARAR DESACTIVAR PRODUCTO (Abre Modal)
    const handleDeactivateClick = (productId: string) => {
        setDeleteConfirm({ isOpen: true, id: productId });
    };

    // CONFIRMAR Y DESACTIVAR PRODUCTO
    const confirmDeactivateProduct = async () => {
        if (!deleteConfirm.id) return;

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await updateProduct(deleteConfirm.id, { isActive: false });
            showNotification('Producto desactivado del catálogo.', 'success');
            fetchData();
        } catch (error: any) {
            showNotification(`Error al desactivar: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
            setDeleteConfirm({ isOpen: false, id: null });
        }
    };

    return (
        <div className="animate-fade-in space-y-10 pb-10">
            {isProductModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    onSave={handleSaveProduct}
                    isLoading={isLoading.save}
                />
            )}

            {/* ======================================= */}
            {/* SECCIÓN 1: PRECIOS DE COMBUSTIBLE */}
            {/* ======================================= */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tarifas de Combustible Globales</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configura los precios actuales por litro para cada tipo de combustible.</p>
                </div>

                <div className="p-6 sm:p-8 border border-indigo-100 dark:border-indigo-900/50 rounded-[2rem] bg-white dark:bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    {/* Decoración de fondo sutil */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>

                    {isLoading.prices ? (
                        <div className="flex justify-center items-center py-10 relative z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"> 
                            {/* Iteramos sobre los tipos de gasolina manteniendo tu esquema de color original */}
                            {[
                                { key: 'magnaPrice', label: 'Magna' },
                                { key: 'premiumPrice', label: 'Premium' },
                                { key: 'dieselPrice', label: 'Diésel' }
                            ].map(fuel => (
                                <div key={fuel.key} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all hover:shadow-md">
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                                        {fuel.label}
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-indigo-500">$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            name={fuel.key}
                                            value={gasPrices[fuel.key as keyof typeof gasPrices]}
                                            onChange={handlePriceChange}
                                            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl font-black text-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 flex justify-end relative z-10">
                        <button
                            onClick={handleSavePrices}
                            disabled={isLoading.save}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading.save ? 'Guardando...' : 'Guardar Precios'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ======================================= */}
            {/* SECCIÓN 2: CATÁLOGO DE PRODUCTOS */}
            {/* ======================================= */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Catálogo de Productos</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra los productos de la tienda física.</p>
                    </div>
                    <button
                        onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                        className="bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-emerald-600 flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {isLoading.products ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PlusIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Catálogo vacío</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">Aún no has registrado ningún producto. Haz clic en "Nuevo Producto" para comenzar.</p>
                        </div>
                    ) : (
                        <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                            {products.map(prod => (
                                <div key={prod.id} className={`flex flex-col sm:flex-row justify-between sm:items-center p-5 transition-all duration-200 ${prod.isActive ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30' : 'bg-gray-50/50 dark:bg-gray-800/50 opacity-75 grayscale-[0.5]'}`}>

                                    <div className="flex items-center gap-4 min-w-0 flex-1 mb-4 sm:mb-0">
                                        {/* Avatar / Inicial del Producto */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm border ${prod.isActive
                                                ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {prod.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className={`font-bold text-base truncate ${prod.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                                                    {prod.name}
                                                </p>
                                                {!prod.isActive && (
                                                    <span className="bg-gray-200 text-gray-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">Inactivo</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                                                {prod.department && <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{prod.department}</span>}
                                                <span>Cód: {prod.barcode || 'N/A'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 pl-16 sm:pl-0">
                                        <div className="text-left sm:text-right">
                                            <p className={`font-black text-xl leading-none mb-1 ${prod.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                                                ${(prod.price || 0).toFixed(2)}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Precio Venta
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(prod); setIsProductModalOpen(true); }}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                                                title="Editar Producto"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>

                                            {prod.isActive && (
                                                <button
                                                    onClick={() => handleDeactivateClick(prod.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                                                    title="Desactivar Producto"
                                                >
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

            {/* Modal Confirmación Desactivar Producto */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center transform transition-all">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <TrashIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">¿Desactivar producto?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                            El producto se marcará como inactivo y ya no aparecerá en las búsquedas ni ventas.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                                disabled={isLoading.save}
                                className="w-1/2 py-3.5 text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeactivateProduct}
                                disabled={isLoading.save}
                                className="w-1/2 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading.save ? 'Procesando...' : 'Desactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceAndProductSection;