import React, { useState, useEffect, useCallback } from 'react';

// Importamos los iconos
import { PlusIcon, PencilIcon, TrashIcon, GiftIcon } from '../../Icons'; 

import { db } from '../../../firebaseConfig'; // Ajusta la ruta si es necesario
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';

interface NivelesSectionProps {
    session: any;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function NivelesSection({ showNotification }: NivelesSectionProps) {
    // Estados principales
    const [niveles, setNiveles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ data: true, save: false });
    
    // Estados del Modal y Edición
    const [showModal, setShowModal] = useState(false);
    const [editingNivel, setEditingNivel] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        level: '',
        name: '',
        description: ''
    });

    // Función principal para obtener datos de la colección "levels"
    const fetchData = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, data: true }));
        try {
            // Buscamos en la colección y ordenamos por el número de nivel
            const q = query(collection(db, "levels"), orderBy("level", "asc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNiveles(data);
        } catch (error: any) {
            // Fallback por si falta el índice de Firebase
            try {
                const snapshot = await getDocs(collection(db, "levels"));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                           .sort((a: any, b: any) => a.level - b.level);
                setNiveles(data);
            } catch (fallbackError: any) {
                showNotification(`Error cargando niveles: ${fallbackError.message}`, 'error');
            }
        } finally {
            setIsLoading(prev => ({ ...prev, data: false }));
        }
    }, [showNotification]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // Abrir modal para crear o editar
    const openModal = (nivel: any = null) => {
        if (nivel) {
            setEditingNivel(nivel);
            setFormData({
                level: nivel.level ? nivel.level.toString() : '',
                name: nivel.name || '',
                description: nivel.description || ''
            });
        } else {
            setEditingNivel(null);
            setFormData({ level: '', name: '', description: '' });
        }
        setShowModal(true);
    };

    // GUARDAR O ACTUALIZAR NIVEL
    const handleSaveNivel = async () => {
        if (!formData.level || !formData.name || !formData.description) {
            showNotification('Completa todos los campos obligatorios', 'info');
            return;
        }

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            const nivelData = {
                level: Number(formData.level),
                name: formData.name,
                description: formData.description
            };

            if (editingNivel && editingNivel.id) {
                // Actualizar existente
                await updateDoc(doc(db, "levels", editingNivel.id), {
                    ...nivelData,
                    lastUpdated: new Date()
                });
                showNotification('Nivel actualizado con éxito.', 'success');
            } else {
                // Crear nuevo
                await addDoc(collection(db, "levels"), {
                    ...nivelData,
                    createdAt: new Date()
                });
                showNotification('Nuevo premio por nivel agregado.', 'success');
            }

            setShowModal(false);
            setEditingNivel(null);
            fetchData(); // Recargar la lista
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    // ELIMINAR NIVEL
    const handleDeleteNivel = async (nivelId: string) => {
        const confirmed = window.confirm("¿Está seguro que desea eliminar este premio?");
        if (!confirmed) return;

        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await deleteDoc(doc(db, "levels", nivelId));
            showNotification('Premio eliminado.', 'success');
            fetchData(); // Recargar la lista
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Niveles y Premios</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configura las recompensas que obtienen los usuarios al alcanzar cada nivel.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-md"
                >
                    <PlusIcon className="w-5 h-5" /> Nuevo Nivel
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {isLoading.data ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : niveles.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <GiftIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay premios configurados</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Comienza agregando los niveles y las recompensas que los usuarios verán en su aplicación.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4 w-24 text-center">Nivel</th>
                                    <th scope="col" className="px-6 py-4">Premio / Recompensa</th>
                                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {niveles.map((nivel) => (
                                    <tr key={nivel.id} className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-lg border border-amber-200 dark:border-amber-800/50">
                                                {nivel.level}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                                {nivel.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {nivel.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(nivel)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                    title="Editar"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteNivel(nivel.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Agregar / Editar Nivel */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <GiftIcon className="w-6 h-6 text-amber-500" />
                            {editingNivel ? 'Editar Premio' : 'Nuevo Premio por Nivel'}
                        </h3>
                        
                        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-lg flex gap-3 items-start">
                            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                <strong>Aviso:</strong> {editingNivel ? 'Los cambios se reflejarán' : 'Este premio se mostrará'} en la app de los usuarios en la sección "Premios por Nivel".
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Número de Nivel</label>
                                <input 
                                    type="number" 
                                    name="level"
                                    value={formData.level}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-lg" 
                                    placeholder="Ej. 2" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Nombre del Premio</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-medium" 
                                    placeholder="Ej. Bebida Gratis" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Descripción</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24" 
                                    placeholder="Ej. Canjea por un refresco o botella de agua en tienda."
                                ></textarea>
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
                                onClick={handleSaveNivel} 
                                disabled={isLoading.save}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-md hover:shadow-amber-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isLoading.save ? 'Guardando...' : (editingNivel ? 'Actualizar Nivel' : 'Guardar Nivel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}