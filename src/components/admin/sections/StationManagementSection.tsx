// src/components/admin/sections/StationManagementSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getStations, addStation, updateStation, deleteStation } from '../../../services/adminService';
import StationModal from '../modals/StationModal';
import { PlusIcon, TrashIcon } from '../../Icons';

const StationManagementSection = ({ showNotification }: any) => {
    const [stations, setStations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStationModalOpen, setIsStationModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<any | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null, name: string}>({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchStations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getStations();
            setStations(data);
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => { fetchStations(); }, [fetchStations]);

    const handleSaveStation = async (stationData: { name: string }) => {
        try {
            if (editingStation) {
                await updateStation(editingStation.id, stationData);
                showNotification("Estación actualizada.", "success");
            } else {
                await addStation(stationData);
                showNotification("Estación agregada.", "success");
            }
            setIsStationModalOpen(false);
            setEditingStation(null);
            fetchStations();
        } catch (error: any) {
            showNotification(error.message, "error");
        }
    };

    const handleDeleteClick = (station: any) => {
        setDeleteConfirm({ isOpen: true, id: station.id, name: station.name });
    };

    const confirmDeleteStation = async () => {
        if (!deleteConfirm.id) return;
        setIsDeleting(true);
        try {
            await deleteStation(deleteConfirm.id);
            showNotification("Estación eliminada correctamente.", "success");
            fetchStations();
        } catch (error: any) {
            showNotification(error.message, "error");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    return (
        <div className="animate-fade-in">
            {isStationModalOpen && <StationModal station={editingStation} onClose={() => { setIsStationModalOpen(false); setEditingStation(null); }} onSave={handleSaveStation} showNotification={showNotification} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estaciones</h2>
                <button className="bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg" onClick={() => { setEditingStation(null); setIsStationModalOpen(true); }}>
                    <PlusIcon className="w-5 h-5" /> Nueva Estación
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando...</p> : (
                    <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400 min-w-[500px]">
                        <thead className="text-[10px] sm:text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr><th className="py-3 px-4 sm:px-6">Nombre</th><th className="py-3 px-4 sm:px-6">ID Interno</th><th className="py-3 px-4 sm:px-6 text-right">Acciones</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stations.map(station => (
                                <tr key={station.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-3 px-4 sm:px-6 font-medium text-gray-900 dark:text-white">{station.name}</td>
                                    <td className="py-3 px-4 sm:px-6 text-xs font-mono text-gray-400">{station.id}</td>
                                    <td className="py-3 px-4 sm:px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingStation(station); setIsStationModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" /><path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteClick(station)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Eliminar">
                                                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Confirmación Eliminar Estación */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrashIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">¿Eliminar estación?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Estás a punto de eliminar:
                        </p>
                        <p className="text-gray-800 dark:text-white font-semibold mb-4">{deleteConfirm.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Esta acción no se puede deshacer. Los usuarios asignados a esta estación no serán eliminados.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })} 
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDeleteStation} 
                                disabled={isDeleting}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-red-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationManagementSection;