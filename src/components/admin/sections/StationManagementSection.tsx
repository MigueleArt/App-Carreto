// src/components/admin/sections/StationManagementSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getStations, addStation, updateStation } from '../../../services/adminService';
import StationModal from '../modals/StationModal';
import { PlusIcon } from '../../Icons'; // Asume que moviste los iconos aquí

const StationManagementSection = ({ showNotification }: any) => {
    const [stations, setStations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStationModalOpen, setIsStationModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<any | null>(null);

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

    return (
        <div className="animate-fade-in">
            {isStationModalOpen && <StationModal station={editingStation} onClose={() => { setIsStationModalOpen(false); setEditingStation(null); }} onSave={handleSaveStation} showNotification={showNotification} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estaciones</h2>
                <button className="bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg" onClick={() => { setEditingStation(null); setIsStationModalOpen(true); }}>
                    <PlusIcon className="w-5 h-5" /> Nueva Estación
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando...</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr><th className="py-4 px-6">Nombre</th><th className="py-4 px-6">ID Interno</th><th className="py-4 px-6 text-right">Acciones</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stations.map(station => (
                                <tr key={station.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{station.name}</td>
                                    <td className="py-4 px-6 text-xs font-mono text-gray-400">{station.id}</td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => { setEditingStation(station); setIsStationModalOpen(true); }} className="text-blue-600 hover:underline">Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StationManagementSection;