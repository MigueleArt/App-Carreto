// src/components/admin/sections/DashboardSection.tsx
import React, { useState, useEffect } from 'react';
// AÑADIDO: Ahora importamos getHistoricalTotals desde el servicio
import { getDashboardSummary, getHistoricalTotals } from '../../../services/adminService'; 
import { KpiCard } from '../components/KpiCard';
import { SessionData } from '../../../types';
import { ChartBarIcon, DocumentTextIcon, UsersIcon, BuildingOfficeIcon } from '../../Icons';

interface DashboardSectionProps {
    session: SessionData;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ session, showNotification }) => {
    // summary contiene: totalRevenue (hoy), totalSalesCount (hoy), totalPointsRedeemed (hoy)
    const [summary, setSummary] = useState<any>(null); 
    const [totalRevenue, setTotalRevenue] = useState<number | null>(0); // Total Histórico (Revenue)
    const [totalSalesCountHist, setTotalSalesCountHist] = useState<number | null>(0); // Total Histórico (Transacciones)
    const [totalPointsRedeemedHist, setTotalPointsRedeemedHist] = useState<number | null>(0); // Total Histórico (Puntos)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // 1. Obtener resumen del día (totalRevenueToday)
                const data = await getDashboardSummary(session);
                setSummary(data);

                // 2. OBTENER TOTALES HISTÓRICOS REALES (Requiere implementación en adminService.ts)
                const historicalData = await getHistoricalTotals(session);
                
                setTotalRevenue(historicalData.totalRevenue);
                setTotalSalesCountHist(historicalData.totalSalesCount);
                setTotalPointsRedeemedHist(historicalData.totalPointsRedeemed);
                
            } catch (error: any) {
                // Muestra el error si la conexión falla o el índice no existe
                showNotification(`Error al cargar datos del Dashboard: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [session, showNotification]);

    const totalRevenueFormatted = `$${(totalRevenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Operativo</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Vista general para <span className="font-semibold text-emerald-600 dark:text-emerald-400">{session.role}</span>
                    {session.stationId && <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Estación: {session.stationId}</span>}
                </p>
            </div>

            {isLoading ? <p className="text-gray-500 text-center py-10">Sincronizando datos...</p> : summary && (
                <div className="space-y-6">
                    
                    {/* --- 1. FACTURACIÓN TOTAL (KPI PRINCIPAL Y GRANDE) --- */}
                    <div className="w-full">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border-l-4 border-indigo-500 transition-all">
                            <dt className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">FACTURACIÓN TOTAL HISTÓRICA</dt>
                            <dd className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {totalRevenueFormatted}
                            </dd>
                            <p className="text-sm text-gray-500 mt-1">Acumulado desde el inicio de operaciones.</p>
                        </div>
                    </div>

                    {/* --- 1.5. TOTALES HISTÓRICOS ADICIONALES --- */}
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Totales Acumulados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <KpiCard 
                            title="Transacciones Históricas" 
                            value={(totalSalesCountHist || 0).toLocaleString()} 
                            icon={<DocumentTextIcon className="w-6 h-6" />} 
                            colorClass="purple"
                        />
                         <KpiCard 
                            title="Puntos Emitidos Totales" 
                            value={(totalPointsRedeemedHist || 0).toLocaleString()} 
                            icon={<UsersIcon className="w-6 h-6" />} 
                            colorClass="pink"
                        />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">Métricas Diarias</h3>
                    
                    {/* --- 2. DISEÑO DE MÉTRICAS DIARIAS (3 Columnas) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* VENTAS DE HOY */}
                        <KpiCard 
                            title="Ventas de Hoy" 
                            value={`$${summary.totalRevenue.toFixed(2)}`} 
                            icon={<ChartBarIcon className="w-6 h-6" />} 
                            colorClass="emerald"
                        />
                        
                        {/* TRANSACCIONES HOY */}
                        <KpiCard 
                            title="Transacciones Hoy" 
                            value={summary.totalSalesCount.toLocaleString()} 
                            icon={<DocumentTextIcon className="w-6 h-6" />} 
                            colorClass="yellow"
                        />
                        
                        {/* PUNTOS CANJEADOS HOY */}
                        <KpiCard 
                            title="Puntos Canjeados" 
                            value={summary.totalPointsRedeemed.toLocaleString()} 
                            icon={<UsersIcon className="w-6 h-6" />} 
                            colorClass="blue"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardSection;