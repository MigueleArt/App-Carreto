// src/components/admin/sections/SalesHistorySection.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSalesHistoryPaginated, getStations, getUsers } from '../../../services/adminService';
import { FilterInput } from '../components/FilterInput';
import { ROLES } from '../../constants/roles'; // Importación de constantes
import { DocumentTextIcon } from '../../Icons'; // Icono para el botón "Ver Ticket"
import { TicketModal } from '../../modals/TicketModal2'; 

const PAGE_SIZE = 20;
const SalesHistorySection = ({ session, showNotification }: any) => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtros
    const [filters, setFilters] = useState({
        stationId: session.role === ROLES.COORDINADOR ? session.stationId : '',
        paymentMethod: '',
        sellerEmail: '',
        startDate: '',
        endDate: ''
    });
    const [stations, setStations] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const firstDocRef = useRef<any>(null);
    const lastDocRef = useRef<any>(null);

    // Estados para el Modal de Ticket
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const fetchPage = useCallback(async (
        cursorDoc: any = null,
        direction: 'next' | 'prev' = 'next'
    ) => {
        setIsLoading(true);
        try {
            // Cargar estaciones solo la primera vez (Admin / Super Admin)
            if (session.role === ROLES.ADMIN || session.role === ROLES.SUPER_ADMIN) {
                const stationData = await getStations();
                setStations(stationData);
                const userData = await getUsers();
                setUsers(userData);
            }

            const cleanFilters = {
                ...filters,
                startDate: filters.startDate ? new Date(filters.startDate) : null,
                endDate: filters.endDate ? new Date(filters.endDate) : null
            };

            const result = await getSalesHistoryPaginated(
                cleanFilters, session, PAGE_SIZE, cursorDoc, direction
            );

            setSales(result.sales);
            firstDocRef.current = result.firstDoc;
            lastDocRef.current = result.lastDoc;
            setTotalCount(result.totalCount);
        } catch (error: any) {
            showNotification(`Error al cargar el historial: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters, session, showNotification]);

    // Cargar primera página cuando cambian filtros
    useEffect(() => {
        setCurrentPage(1);
        firstDocRef.current = null;
        lastDocRef.current = null;
        fetchPage(null, 'next');
    }, [fetchPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages && lastDocRef.current) {
            setCurrentPage(prev => prev + 1);
            fetchPage(lastDocRef.current, 'next');
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1 && firstDocRef.current) {
            setCurrentPage(prev => prev - 1);
            fetchPage(firstDocRef.current, 'prev');
        }
    };

    const handleFilterChange = (e: any) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleViewTicket = (sale: any) => {
        const dateObject = sale.date && sale.date.seconds
            ? new Date(sale.date.seconds * 1000)
            : sale.date;

        setSelectedSale({
            ...sale,
            date: dateObject,
            points: sale.points || { before: 0, earned: 0, redeemed: 0, after: 0 },
            folio: sale.id
        });
        setIsTicketModalOpen(true);
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return 'N/A';
        let date;
        if (dateValue.seconds) {
            date = new Date(dateValue.seconds * 1000);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            return 'Inválida';
        }
        return date.toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="animate-fade-in">
            {isTicketModalOpen && (
                <TicketModal
                    receipt={selectedSale}
                    onClose={() => setIsTicketModalOpen(false)}
                />
            )}

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Historial de Ventas</h2>

            {/* Filtros */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <FilterInput label="Estación" name="stationId" value={filters.stationId || ''} onChange={handleFilterChange} type="select" disabled={session.role === ROLES.COORDINADOR}>
                    <option value="">Todas</option>
                    {stations.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {session.role === ROLES.COORDINADOR && session.stationId && <option value={session.stationId}>Mi Estación</option>}
                </FilterInput>
                <FilterInput label="Vendedor" name="sellerEmail" value={filters.sellerEmail} onChange={handleFilterChange} type="select">
                    <option value="">Todos</option>
                    {users.map((u: any) => <option key={u.id} value={u.email}>{u.name || u.email}</option>)}
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

            {/* Contenido */}
            {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center text-gray-500">
                    Cargando historial...
                </div>
            ) : sales.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center text-gray-500">
                    Sin resultados.
                </div>
            ) : (
                <>
                    {/* === VISTA MÓVIL / TABLET: Cards === */}
                    <div className="lg:hidden space-y-3">
                        {sales.map(sale => (
                            <div key={sale.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 active:scale-[0.99] transition-transform">
                                {/* Fila superior: Total + Pago */}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xl font-black text-emerald-600">${(sale.total || 0).toFixed(2)}</span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        sale.paymentMethod === 'puntos' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        sale.paymentMethod === 'terminal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>{sale.paymentMethod}</span>
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Cliente</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium truncate">{sale.customerName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Vendedor</p>
                                        <p className="text-gray-600 dark:text-gray-300 truncate">{sale.sellerName || users.find((u: any) => u.email === sale.sellerEmail)?.name || sale.sellerEmail || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Fecha</p>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs">{formatDate(sale.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Estación</p>
                                        <p className="text-gray-600 dark:text-gray-300 truncate">{sale.stationName || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Botón Ver Ticket */}
                                <button
                                    onClick={() => handleViewTicket(sale)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-sm font-medium border border-indigo-100 dark:border-indigo-800/30"
                                >
                                    <DocumentTextIcon className="w-4 h-4" /> Ver Ticket
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* === VISTA DESKTOP: Tabla === */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="py-4 px-6">Fecha</th>
                                    <th className="py-4 px-6">Vendedor</th>
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
                                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{formatDate(sale.date)}</td>
                                        <td className="py-4 px-6 text-xs text-gray-500">{sale.sellerName || users.find((u: any) => u.email === sale.sellerEmail)?.name || sale.sellerEmail || 'N/A'}</td>
                                        <td className="py-4 px-6">{sale.customerName || 'N/A'}</td>
                                        <td className="py-4 px-6 text-gray-500">{sale.stationName || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${sale.paymentMethod === 'puntos' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{sale.paymentMethod}</span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-emerald-600">${(sale.total || 0).toFixed(2)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleViewTicket(sale)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1">
                                                <DocumentTextIcon className="w-4 h-4" /> Ver Ticket
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Barra de Paginación — responsive */}
            {!isLoading && totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {totalCount} venta{totalCount !== 1 ? 's' : ''} en total
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1}
                            className="px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            « Anterior
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            className="px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistorySection;