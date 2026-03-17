import React, { useState, useEffect, useCallback } from 'react';

// Importamos los iconos desde tu archivo centralizado (Agregamos CameraIcon)
import { PlusIcon, PencilIcon, TrashIcon, CameraIcon } from '../../Icons'; 

import { db } from '../../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';

interface PromocionesSectionProps {
    session: any;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function PromocionesSection({ showNotification }: PromocionesSectionProps) {
    // Estados principales
    const [promociones, setPromociones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ data: true, save: false });
    
    // Estados del Modal y Edición
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        imageUrl: '' 
    });

    // Estados para la imagen
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageHasChanged, setImageHasChanged] = useState(false);

    // Estado para la alerta de confirmación de eliminación
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });

    // Calculamos el string de HOY para las etiquetas de estado automáticas
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Función principal para obtener datos de la colección "promotions"
    const fetchData = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, data: true }));
        try {
            // Buscamos en la colección y ordenamos por título
            const q = query(collection(db, "promotions"), orderBy("titulo"));
            const snapshot = await getDocs(q);
            const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPromociones(promos);
        } catch (error: any) {
            // Fallback por si falta el índice de Firebase
            try {
                const snapshot = await getDocs(collection(db, "promotions"));
                const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPromociones(promos);
            } catch (fallbackError: any) {
                showNotification(`Error cargando promociones: ${fallbackError.message}`, 'error');
            }
        } finally {
            setIsLoading(prev => ({ ...prev, data: false }));
        }
    }, [showNotification]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // Abrir modal para crear o editar
    const openModal = (promo: any = null) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                titulo: promo.titulo || '',
                descripcion: promo.descripcion || '',
                fechaInicio: promo.fechaInicio || '',
                fechaFin: promo.fechaFin || '',
                imageUrl: promo.imageUrl || ''
            });
            setImagePreview(promo.imageUrl || null);
        } else {
            setEditingPromo(null);
            setFormData({ titulo: '', descripcion: '', fechaInicio: '', fechaFin: '', imageUrl: '' });
            setImagePreview(null);
        }
        setImageHasChanged(false);
        setShowModal(true);
    };

    // MANEJAR SELECCIÓN DE IMAGEN (CONVERTIR A BASE64 DIRECTAMENTE)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Límite de 800kb para no saturar Firestore
            if (file.size > 800 * 1024) {
                showNotification('La imagen es muy pesada. Por favor sube una imagen menor a 800KB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setImageHasChanged(true);
                showNotification('Imagen cargada correctamente.', 'info');
            };
            reader.readAsDataURL(file); 
        }
    };

    // GUARDAR O ACTUALIZAR PROMOCIÓN
    const handleSavePromo = async () => {
        if (!formData.titulo || !formData.descripcion || !formData.fechaInicio || !formData.fechaFin) {
            showNotification('Completa todos los campos obligatorios', 'error');
            return;
        }

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            const finalImageUrl = imageHasChanged ? imagePreview : formData.imageUrl;

            const promoData = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                imageUrl: finalImageUrl || ''
            };

            if (editingPromo && editingPromo.id) {
                // Actualizar existente (eliminamos el campo activo manual si existía)
                await updateDoc(doc(db, "promotions", editingPromo.id), {
                    ...promoData,
                    lastUpdated: new Date()
                });
                showNotification('Promoción actualizada con éxito.', 'success');
            } else {
                // Crear nueva
                await addDoc(collection(db, "promotions"), {
                    ...promoData,
                    createdAt: new Date()
                });
                showNotification('Promoción agregada exitosamente.', 'success');
            }

            setShowModal(false);
            setEditingPromo(null);
            setImagePreview(null);
            setImageHasChanged(false);
            fetchData(); 
        } catch (error: any) {
            showNotification(`Error al guardar la promoción: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    // PREPARAR ELIMINAR PROMOCIÓN (Abre Modal de confirmación)
    const handleDeleteClick = (promoId: string) => {
        setDeleteConfirm({ isOpen: true, id: promoId });
    };

    // CONFIRMAR Y ELIMINAR PROMOCIÓN EN FIREBASE
    const confirmDeletePromo = async () => {
        if (!deleteConfirm.id) return;

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await deleteDoc(doc(db, "promotions", deleteConfirm.id));
            showNotification('Promoción eliminada correctamente.', 'success');
            fetchData(); // Recargar la lista
        } catch (error: any) {
            showNotification(`Error al eliminar la promoción: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
            setDeleteConfirm({ isOpen: false, id: null });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Promociones y Ofertas</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Crea banners y promociones que aparecerán en la app del usuario. Se ocultarán automáticamente cuando caduquen.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-md"
                >
                    <PlusIcon className="w-5 h-5" /> Nueva Promoción
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {isLoading.data ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : promociones.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay promociones activas</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando tu primera oferta para los clientes.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Promoción</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap">Vigencia</th>
                                    <th scope="col" className="px-6 py-4 text-center">Estado Automático</th>
                                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promociones.map((promo) => {
                                    // Calculamos si la promoción ya pasó la fecha de fin
                                    const isExpired = promo.fechaFin && promo.fechaFin < todayStr;

                                    return (
                                        <tr key={promo.id} className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600 transition-all ${isExpired ? 'opacity-50 grayscale' : ''}`}>
                                                        {promo.imageUrl ? (
                                                            <img src={promo.imageUrl} alt={promo.titulo} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <CameraIcon className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-base transition-colors ${isExpired ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{promo.titulo}</div>
                                                        <div className="text-xs text-gray-500 mt-1 max-w-md line-clamp-2">{promo.descripcion}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Del: {promo.fechaInicio}</div>
                                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Al: {promo.fechaFin}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    {/* Badge de Estado Dinámico */}
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                        isExpired 
                                                            ? 'bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/30 dark:border-red-800/50' 
                                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50'
                                                    }`}>
                                                        {isExpired ? 'Expirada' : 'Activa'}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="text-[10px] text-gray-400 font-medium">No visible en App</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openModal(promo)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(promo.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Agregar / Editar Promoción */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            {editingPromo ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                        </h3>
                        
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 p-3 rounded-lg flex gap-3 items-start">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Aviso:</strong> La promoción se ocultará automáticamente a las 00:00hrs una vez superada su <strong>Fecha de Fin</strong>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            
                            {/* Input de Imagen Base64 para el Banner */}
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Banner de la Promoción</label>
                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-40 overflow-hidden group bg-gray-100 dark:bg-gray-900">
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center pointer-events-none rounded-lg">
                                                <span className="text-white font-medium text-sm">Cambiar banner</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <CameraIcon className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Sube una imagen</span>
                                            <span className="text-xs text-gray-400 mt-1">Máx 800KB. Recomendado: Formato Horizontal.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Título de la Promoción</label>
                                <input 
                                    type="text" 
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                                    placeholder="Ej. 20% Extra en Puntos" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Descripción corta</label>
                                <textarea 
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24" 
                                    placeholder="Detalles de la promoción que verá el usuario..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Fecha de Inicio</label>
                                    <input 
                                        type="date" 
                                        name="fechaInicio"
                                        value={formData.fechaInicio}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Fecha de Fin</label>
                                    <input 
                                        type="date" 
                                        name="fechaFin"
                                        value={formData.fechaFin}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
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
                                onClick={handleSavePromo} 
                                disabled={isLoading.save}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-indigo-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading.save ? 'Guardando...' : (editingPromo ? 'Actualizar' : 'Publicar Promoción')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmación Eliminar */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrashIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">¿Eliminar promoción?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Esta acción no se puede deshacer. La promoción desaparecerá inmediatamente de la aplicación para todos los usuarios.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null })} 
                                disabled={isLoading.save}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDeletePromo} 
                                disabled={isLoading.save}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-red-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading.save ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}