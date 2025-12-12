// src/components/admin/sections/SalesHistorySection.tsx
import React, { useState, useEffect } from 'react';
import { getSalesHistory, getStations } from '../../../services/adminService';
import { FilterInput } from '../components/FilterInput';
import { ROLES } from '../../constants/roles'; // Importación de constantes
import { DocumentTextIcon } from '../../Icons'; // Icono para el botón "Ver Ticket"
import { TicketModal } from '../../modals/TicketModal';
const SalesHistorySection = ({ session, showNotification }: any) => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filtros: Eliminamos dispatcherId del estado
    const [filters, setFilters] = useState({ 
        stationId: session.role === ROLES.COORDINADOR ? session.stationId : '', 
        paymentMethod: '', 
        startDate: '', 
        endDate: '' 
    });
    const [stations, setStations] = useState<any[]>([]);
    
    // Estados para el Modal de Ticket
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Solo Administradores y Super Admin ven todas las estaciones
                if (session.role === ROLES.ADMIN || session.role === ROLES.SUPER_ADMIN) {
                    const stationData = await getStations();
                    setStations(stationData);
                }
                // Convertir fechas de string a Date para el servicio
                const cleanFilters = { 
                    ...filters, 
                    startDate: filters.startDate ? new Date(filters.startDate) : null, 
                    endDate: filters.endDate ? new Date(filters.endDate) : null 
                };
                const history = await getSalesHistory(cleanFilters, session);
                setSales(history);
            } catch (error: any) {
                showNotification(`Error al cargar el historial: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [filters, session, showNotification]);

    const handleFilterChange = (e: any) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Función que prepara los datos del ticket y abre el modal
    const handleViewTicket = (sale: any) => {
        // Conversión crucial: Convertir Timestamp de Firestore a objeto Date para el modal
        const dateObject = sale.date && sale.date.seconds 
            ? new Date(sale.date.seconds * 1000) 
            : sale.date;

        setSelectedSale({
            ...sale,
            date: dateObject,
            // Asegurar que exista el objeto 'points' para evitar fallos en el modal
            points: sale.points || { before: 0, earned: 0, redeemed: 0, after: 0 },
            // Asumir que el ID es el folio si no hay campo 'folio'
            folio: sale.id 
        });
        setIsTicketModalOpen(true);
    };

    // Función para formatear la fecha a un formato legible en la tabla
    const formatDate = (dateValue: any) => {
        if (!dateValue) return 'N/A';
        
        let date;
        // Manejar Timestamp de Firestore o Date ya convertidos
        if (dateValue.seconds) {
            date = new Date(dateValue.seconds * 1000);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            return 'Inválida';
        }

        // Formato legible: ej. 28 nov. 2025, 13:20
        return date.toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    return (
        <div className="animate-fade-in">
            {/* Renderizar el Modal de Ticket */}
            {isTicketModalOpen && (
                <TicketModal 
                    receipt={selectedSale} 
                    onClose={() => setIsTicketModalOpen(false)}
                    showNotification={showNotification}
                />
            )}

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Historial de Ventas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <FilterInput label="Estación" name="stationId" value={filters.stationId || ''} onChange={handleFilterChange} type="select" disabled={session.role === ROLES.COORDINADOR}>
                    <option value="">Todas</option>
                    {stations.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {session.role === ROLES.COORDINADOR && session.stationId && <option value={session.stationId}>Mi Estación</option>}
                </FilterInput>
                
                <FilterInput label="Método Pago" name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} type="select">
                    <option value="">Todos</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="terminal">Terminal</option>
                    <option value="puntos">Puntos</option>
                </FilterInput>
                <FilterInput label="Desde" name="startDate" value={filters.startDate} onChange={handleFilterChange} type="date" />
                <FilterInput label="Hasta" name="endDate" value={filters.endDate} onChange={handleFilterChange} type="date" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando historial...</p> : sales.length === 0 ? <p className="p-10 text-center text-gray-500">Sin resultados.</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="py-4 px-6">Fecha</th>
                                <th className="py-4 px-6">Cliente</th>
                                <th className="py-4 px-6">Estación</th>
                                <th className="py-4 px-6">Pago</th>
                                <th className="py-4 px-6">Total</th>
                                <th className="py-4 px-6 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    {/* Mostrar fecha formateada */}
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{formatDate(sale.date)}</td>
                                    <td className="py-4 px-6">{sale.customerName || 'N/A'}</td>
                                    <td className="py-4 px-6 text-gray-500">{sale.stationName || 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${sale.paymentMethod === 'puntos' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{sale.paymentMethod}</span>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-emerald-600">${(sale.total || 0).toFixed(2)}</td>
                                    <td className="py-4 px-6 text-right">
                                        {/* Botón Ver Ticket */}
                                        <button onClick={() => handleViewTicket(sale)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1">
                                            <DocumentTextIcon className="w-4 h-4" /> Ver Ticket
                                        </button>
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

export default SalesHistorySection;