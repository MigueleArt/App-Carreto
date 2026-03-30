// src/components/admin/sections/TerminalConfigSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getStations, getAllTerminalConfigs, saveTerminalConfig, TerminalConfig } from '../../../services/adminService';

interface TerminalConfigSectionProps {
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const TerminalConfigSection: React.FC<TerminalConfigSectionProps> = ({ showNotification }) => {
    const [stations, setStations] = useState<any[]>([]);
    const [configs, setConfigs] = useState<Record<string, TerminalConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingStationId, setSavingStationId] = useState<string | null>(null);
    const [expandedStation, setExpandedStation] = useState<string | null>(null);

    // Estado local para edición de formularios
    const [formData, setFormData] = useState<Record<string, TerminalConfig>>({});

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [stationList, terminalConfigs] = await Promise.all([
                getStations(),
                getAllTerminalConfigs(),
            ]);
            setStations(stationList);

            // Indexar configs por stationId
            const configMap: Record<string, TerminalConfig> = {};
            terminalConfigs.forEach(cfg => {
                configMap[cfg.stationId] = cfg;
            });
            setConfigs(configMap);

            // Inicializar formData con los datos existentes o defaults para cada estación
            const initialFormData: Record<string, TerminalConfig> = {};
            stationList.forEach(station => {
                const existing = configMap[station.id];
                initialFormData[station.id] = existing || {
                    stationId: station.id,
                    stationName: station.name,
                    ip: '',
                    port: '1818',
                    affiliation: '',
                    terminalId: '',
                    user: '',
                    password: '',
                    mode: 'AUT',
                    isActive: false,
                };
            });
            setFormData(initialFormData);
        } catch (error: any) {
            showNotification(error.message || 'Error al cargar datos', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleInputChange = (stationId: string, field: keyof TerminalConfig, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [stationId]: {
                ...prev[stationId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (stationId: string) => {
        const config = formData[stationId];
        if (!config.ip.trim()) {
            showNotification('La dirección IP es obligatoria.', 'error');
            return;
        }

        setSavingStationId(stationId);
        try {
            const station = stations.find(s => s.id === stationId);
            await saveTerminalConfig({
                ...config,
                stationId,
                stationName: station?.name || '',
            });
            showNotification(`Terminal de "${station?.name}" configurada correctamente.`, 'success');
            // Actualizar el config guardado
            setConfigs(prev => ({ ...prev, [stationId]: { ...config, stationId } }));
        } catch (error: any) {
            showNotification(error.message || 'Error al guardar', 'error');
        } finally {
            setSavingStationId(null);
        }
    };

    const isConfigured = (stationId: string) => {
        return configs[stationId]?.ip?.trim() ? true : false;
    };

    const hasChanges = (stationId: string) => {
        const current = formData[stationId];
        const saved = configs[stationId];
        if (!saved) return current?.ip?.trim() ? true : false;
        return current?.ip !== saved.ip || 
               current?.port !== saved.port || 
               current?.affiliation !== saved.affiliation ||
               current?.terminalId !== saved.terminalId ||
               current?.user !== saved.user ||
               current?.password !== saved.password ||
               current?.mode !== saved.mode ||
               current?.isActive !== saved.isActive;
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Cargando configuración de terminales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración de Terminales</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure la dirección IP y credenciales de la terminal de cobro para cada estación.
                </p>
            </div>

            {stations.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No hay estaciones registradas. Agregue estaciones primero.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stations.map(station => {
                        const stationForm = formData[station.id];
                        if (!stationForm) return null;
                        const isExpanded = expandedStation === station.id;
                        const configured = isConfigured(station.id);
                        const modified = hasChanges(station.id);
                        const isSaving = savingStationId === station.id;

                        return (
                            <div key={station.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200">
                                {/* Header de estación — clic para expandir/colapsar */}
                                <button
                                    onClick={() => setExpandedStation(isExpanded ? null : station.id)}
                                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left gap-3 sm:gap-0"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Indicador de estado */}
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${configured && stationForm.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : configured ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-white text-lg">{station.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {configured
                                                    ? `IP: ${configs[station.id]?.ip}:${configs[station.id]?.port || '1818'} ${stationForm.isActive ? '• Activa' : '• Inactiva'}`
                                                    : 'Sin configurar'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {modified && (
                                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                                Cambios sin guardar
                                            </span>
                                        )}
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Formulario expandible */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-5 space-y-4 sm:space-y-5">
                                        {/* Fila 1: IP y Puerto */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    Dirección IP de la Terminal *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: 192.168.100.135"
                                                    value={stationForm.ip}
                                                    onChange={(e) => handleInputChange(station.id, 'ip', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    Puerto
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="1818"
                                                    value={stationForm.port}
                                                    onChange={(e) => handleInputChange(station.id, 'port', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Fila 2: Afiliación, Terminal ID y Modo */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    No. de Afiliación
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: 7884666"
                                                    value={stationForm.affiliation}
                                                    onChange={(e) => handleInputChange(station.id, 'affiliation', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    ID Terminal (banco)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: 327782962"
                                                    value={stationForm.terminalId || ''}
                                                    onChange={(e) => handleInputChange(station.id, 'terminalId', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    Modo
                                                </label>
                                                <select
                                                    value={stationForm.mode}
                                                    onChange={(e) => handleInputChange(station.id, 'mode', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                >
                                                    <option value="AUT">Automático (AUT)</option>
                                                    <option value="PRU">Pruebas (PRU)</option>
                                                    <option value="RND">Random (RND)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Fila 3: Usuario y Contraseña */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    Usuario
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="USUARIO"
                                                    value={stationForm.user}
                                                    onChange={(e) => handleInputChange(station.id, 'user', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                    Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="********"
                                                    value={stationForm.password}
                                                    onChange={(e) => handleInputChange(station.id, 'password', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Toggle activo + Botón guardar */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={stationForm.isActive}
                                                        onChange={(e) => handleInputChange(station.id, 'isActive', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${stationForm.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <div className={`absolute w-5 h-5 bg-white rounded-full shadow-md top-0.5 transition-transform duration-200 ${stationForm.isActive ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
                                                            style={{ transform: stationForm.isActive ? 'translateX(22px)' : 'translateX(0px)' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {stationForm.isActive ? 'Terminal activa' : 'Terminal inactiva'}
                                                </span>
                                            </label>

                                            <button
                                                onClick={() => handleSave(station.id)}
                                                disabled={isSaving || !modified}
                                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                                    modified
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/30'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                } disabled:opacity-50`}
                                            >
                                                {isSaving ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Guardando...
                                                    </span>
                                                ) : 'Guardar Configuración'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TerminalConfigSection;
