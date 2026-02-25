import React, { useState, useEffect, useCallback } from 'react';

// Importamos los iconos desde tu archivo centralizado (Eliminamos TrashIcon ya que no se usará)
import { PlusIcon, PencilIcon, CameraIcon } from '../../Icons'; 

import { db } from '../../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
// ❌ ELIMINAMOS FIREBASE STORAGE POR COMPLETO

interface TiendaSectionProps {
    session: any;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function TiendaSection({ showNotification }: TiendaSectionProps) {
    // Estados principales
    const [productos, setProductos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ products: true, save: false });
    
    // Estados del Modal y Edición
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        points: '',
        stock: '',
        imageUrl: ''
    });

    // Estados para la imagen
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageHasChanged, setImageHasChanged] = useState(false);

    // Función principal para obtener datos de la colección "products"
    const fetchData = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, products: true }));
        try {
            const q = query(collection(db, "products"), orderBy("name"));
            const snapshot = await getDocs(q);
            const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProductos(prods);
        } catch (error: any) {
            try {
                const snapshot = await getDocs(collection(db, "products"));
                const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProductos(prods);
            } catch (fallbackError: any) {
                showNotification(`Error cargando catálogo: ${fallbackError.message}`, 'error');
            }
        } finally {
            setIsLoading(prev => ({ ...prev, products: false }));
        }
    }, [showNotification]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // Abrir modal para crear o editar
    const openModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                price: product.price ? product.price.toString() : '0',
                points: product.points ? product.points.toString() : '0',
                stock: product.stock ? product.stock.toString() : '0',
                imageUrl: product.imageUrl || ''
            });
            setImagePreview(product.imageUrl || null);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: '', points: '', stock: '', imageUrl: '' });
            setImagePreview(null);
        }
        setImageHasChanged(false);
        setShowModal(true);
    };

    // MANEJAR SELECCIÓN DE IMAGEN (CONVERTIR A BASE64 DIRECTAMENTE)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Límite de 800kb para no saturar Firestore (límite de 1MB por doc)
            if (file.size > 800 * 1024) {
                showNotification('La imagen es muy pesada. Por favor sube una imagen menor a 800KB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setImageHasChanged(true);
            };
            reader.readAsDataURL(file); // Convierte la foto a texto
        }
    };

    // GUARDAR O ACTUALIZAR PRODUCTO
    const handleSaveProduct = async () => {
        if (!formData.name || !formData.price || !formData.points || !formData.stock) {
            showNotification('Completa todos los campos obligatorios', 'info');
            return;
        }

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            // Si la imagen cambió, usamos el Base64, si no, conservamos la que tenía
            const finalImageUrl = imageHasChanged ? imagePreview : formData.imageUrl;

            const productData = {
                name: formData.name,
                price: Number(formData.price),
                points: Number(formData.points),
                stock: Number(formData.stock),
                imageUrl: finalImageUrl || '', 
            };

            if (editingProduct && editingProduct.id) {
                await updateDoc(doc(db, "products", editingProduct.id), {
                    ...productData,
                    lastUpdated: new Date()
                });
                showNotification('Producto actualizado con éxito.', 'success');
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    isActive: true,
                    createdAt: new Date()
                });
                showNotification('Producto agregado a la tienda.', 'success');
            }

            setShowModal(false);
            setEditingProduct(null);
            setImagePreview(null);
            setImageHasChanged(false);
            fetchData(); 
        } catch (error: any) {
            console.error("Error al guardar:", error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tienda de Recompensas</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra los productos que los usuarios pueden comprar o canjear con sus puntos.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-md"
                >
                    <PlusIcon className="w-5 h-5" /> Agregar Producto
                </button>
            </div>

            {/* Manejo de estado de Carga */}
            {isLoading.products ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : productos.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <CameraIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay productos en la tienda</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Comienza agregando un nuevo producto al catálogo.</p>
                </div>
            ) : (
                /* Grid de Productos */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productos.map((prod) => (
                        <div key={prod.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="h-48 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative group">
                                {prod.imageUrl ? (
                                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                    <CameraIcon className="w-10 h-10 text-gray-400" />
                                )}
                                <div 
                                    onClick={() => openModal(prod)}
                                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer"
                                >
                                    <span className="text-white text-sm font-medium flex items-center gap-2">
                                        <PencilIcon className="w-4 h-4" /> Editar Imagen
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800 dark:text-white truncate pr-2">{prod.name}</h3>
                                    {/* Etiquetas de Precio y Puntos */}
                                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                            ${prod.price || 0}
                                        </span>
                                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {prod.points || 0} Pts
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Stock disponible: <span className="font-semibold text-gray-700 dark:text-gray-300">{prod.stock || 0}</span></p>
                                
                                <div className="flex justify-end items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => openModal(prod)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear / Editar Producto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h3>
                        
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 p-3 rounded-lg flex gap-3 items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Aviso:</strong> {editingProduct ? 'Los cambios que realices aquí se reflejarán' : 'El producto que agregues aquí se reflejará'} automáticamente en la app de <strong>Carreto Puntos</strong>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            
                            {/* Input de Imagen Base64 */}
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Imagen del Producto</label>
                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-40 overflow-hidden group">
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center pointer-events-none">
                                                <span className="text-white font-medium text-sm">Cambiar foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <CameraIcon className="w-8 h-8 mb-2" />
                                            <span className="text-sm">Haz clic o arrastra para subir imagen</span>
                                            <span className="text-xs text-gray-400 mt-1">Máx 800KB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Nombre</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    placeholder="Ej. Termo Metálico" 
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Precio ($)</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold" 
                                        placeholder="0.00" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Puntos (Pts)</label>
                                    <input 
                                        type="number" 
                                        name="points"
                                        value={formData.points}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold" 
                                        placeholder="1500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Stock Inicial</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold" 
                                        placeholder="50" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button 
                                onClick={() => setShowModal(false)} 
                                disabled={isLoading.save}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveProduct} 
                                disabled={isLoading.save}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-emerald-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading.save ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Guardar Producto')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}