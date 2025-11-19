import React, { useState, useEffect, useCallback } from 'react';

// --- Importaciones de Servicios ---
// Ruta relativa: ../../ para ir de src/components/screens/ a src/services/
import {
    getDashboardSummary,
    getUsers,
    addUser,
    updateUser,
    getStations,
    addStation,
    updateStation,
    getSalesHistory,
    getGasPrices,
    updateGasPrices,
    getProducts,
    addProduct,
    updateProduct
} from '../../services/adminService';

// --- Importaciones de Tipos ---
// Ruta relativa: ../../ para ir de src/components/screens/ a src/types.ts
import { SessionData } from '../../types';

// --- Iconos ---
const ChartBarIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25C3.504 21 3 20.496 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 9.75 19.875V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const UsersIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18 18.75a.75.75 0 0 0 .75-.75V8.636a.75.75 0 0 0-.44-1.358l-5.404-2.702a.75.75 0 0 0-.612 0L6.44 7.278a.75.75 0 0 0-.44 1.358v9.364a.75.75 0 0 0 .75.75h11.25Z" /></svg>;
const BuildingOfficeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M.75 9.75a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v6.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-19.5a.75.75 0 0 1-.75-.75v-2.25a.75.75 0 0 1 .75-.75H3V9.75H.75ZM4.5 9.75v6.75h10.5V9.75H4.5Z" clipRule="evenodd" /></svg>;
const CogIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.178-2.034A1.875 1.875 0 0 0 14.922 2.25h-3.844Zm-1.87 1.125a.75.75 0 0 1 .75-.75h.008l.008.002a.75.75 0 0 1 .742.748l.178 2.034a3 3 0 0 1-1.897 3.272l-2.148.81a.75.75 0 0 1-.74-.004l-2.148-.81a3 3 0 0 1-1.897-3.272l.178-2.034a.75.75 0 0 1 .748-.748l.008-.002h.008a.75.75 0 0 1 .75.75v.008c0 .04-.002.079-.005.118l-.34 1.558a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.34-1.558a.754.754 0 0 1-.005-.118v-.008Zm1.144 11.625c-.917 0-1.699.663-1.85 1.567l-.178 2.034a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.178-2.034a1.875 1.875 0 0 0-1.85-1.567h-3.844Zm1.125 1.875a.75.75 0 0 1 .75-.75h.008l.008.002a.75.75 0 0 1 .742.748l.178 2.034a3 3 0 0 1-1.897 3.272l-2.148.81a.75.75 0 0 1-.74-.004l-2.148-.81a3 3 0 0 1-1.897-3.272l.178-2.034a.75.75 0 0 1 .748-.748l.008-.002h.008a.75.75 0 0 1 .75.75v.008c0 .04-.002.079-.005.118l-.34 1.558a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.34-1.558a.754.754 0 0 1-.005-.118v-.008Z" clipRule="evenodd" /></svg>;
const ArrowLeftIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" /></svg>;
const DocumentTextIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3h-1.875A3.75 3.75 0 0 0 5.625 6.75v1.875c0 .207.168.375.375.375h1.875A3.75 3.75 0 0 0 11.625 12v1.875a.375.375 0 0 1-.375.375H9.375A3.75 3.75 0 0 0 6 17.625v1.875c0 .207.168.375.375.375h11.25V1.875C17.625 1.668 17.457 1.5 17.25 1.5H5.625Z" clipRule="evenodd" /></svg>;
const PlusIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>;
const PencilIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" /></svg>;
const TrashIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>;

// Constantes de Roles
const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    COORDINADOR: 'Coordinador',
    DESPACHADOR: 'Despachador'
};

// ====================================================================
// --- COMPONENTES AUXILIARES ---
// ====================================================================

const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full">
            {icon}
        </div>
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">{title}</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</dd>
        </div>
    </div>
);

const FilterInput = ({ label, name, value, onChange, type, disabled = false, children = null }: any) => (
    <div className="w-full">
        <label htmlFor={name} className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
        {type === 'select' ? (
            <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {children}
            </select>
        ) : (
            <input id={name} name={name} type={type} value={value} onChange={onChange} disabled={disabled} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
        )}
    </div>
);

// ====================================================================
// --- MODALES (User, Station, Product) ---
// ====================================================================

const UserModal = ({ user, onClose, onSave, showNotification, session }: any) => {
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState(user?.role || ROLES.DESPACHADOR);
    const [stationId, setStationId] = useState(user?.stationId || '');

    // Lógica de permisos en el Modal
    const canAssignRole = (targetRole: string) => {
        if (session.role === ROLES.SUPER_ADMIN) return true;
        if (session.role === ROLES.ADMIN) return targetRole !== ROLES.SUPER_ADMIN;
        if (session.role === ROLES.COORDINADOR) return targetRole === ROLES.DESPACHADOR;
        return false;
    };

    // Si es Coordinador, la estación se fija automáticamente
    useEffect(() => {
        if (session.role === ROLES.COORDINADOR) {
            setStationId(session.stationId || '');
        }
    }, [session]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !role) {
            showNotification("Email y Rol son requeridos.", "error");
            return;
        }
        if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN && !stationId) {
            showNotification("Debe asignar una Estación a Coordinadores y Despachadores.", "error");
            return;
        }
        onSave({ email, role, stationId });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {user ? 'Editar' : 'Nuevo'} Usuario
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestión de acceso al sistema</p>
                </div>
                
                <div className="p-6 space-y-5">
                    {!user && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                <strong>Nota:</strong> Esto crea el perfil en base de datos. Recuerde crear las credenciales en <em>Firebase Auth</em>.
                            </p>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@carreto.com" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
                            {canAssignRole(ROLES.DESPACHADOR) && <option value={ROLES.DESPACHADOR}>Despachador</option>}
                            {canAssignRole(ROLES.COORDINADOR) && <option value={ROLES.COORDINADOR}>Coordinador</option>}
                            {canAssignRole(ROLES.ADMIN) && <option value={ROLES.ADMIN}>Administrador</option>}
                            {canAssignRole(ROLES.SUPER_ADMIN) && <option value={ROLES.SUPER_ADMIN}>Super Admin</option>}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Estación</label>
                        <input 
                            type="text" 
                            value={stationId} 
                            onChange={(e) => setStationId(e.target.value)} 
                            placeholder="Ej. est-001" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                            disabled={session.role === ROLES.COORDINADOR} // Coordinador no puede cambiar su propia estación
                        />
                        {session.role === ROLES.COORDINADOR && <p className="text-xs text-gray-400 mt-1">Fijo a su estación asignada.</p>}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors font-medium text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg">Guardar Usuario</button>
                </div>
            </form>
        </div>
    );
};

const StationModal = ({ station, onClose, onSave, showNotification }: any) => {
    const [name, setName] = useState(station?.name || '');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) { showNotification("El nombre es requerido.", "error"); return; }
        onSave({ name });
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{station ? 'Editar' : 'Nueva'} Estación</h2>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Estación</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Carreto Centro" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 transition-colors text-sm font-medium">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-md">Guardar</button>
                </div>
            </form>
        </div>
    );
};

const ProductModal = ({ product, onClose, onSave, isLoading }: any) => {
    const [formData, setFormData] = useState(product || { name: '', price: '', barcode: '', department: '', isActive: true });
    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) { alert('Nombre y Precio requeridos.'); return; }
        onSave({ ...formData, price: parseFloat(String(formData.price)) || 0 });
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{product ? 'Editar' : 'Nuevo'} Producto</h2>
                </div>
                <div className="p-6 space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre Producto" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Precio ($)" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                        <input name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Código Barras" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <input name="department" value={formData.department} onChange={handleChange} placeholder="Departamento" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500" />
                        <span className="font-medium">Producto Activo (Visible en POS)</span>
                    </label>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 transition-colors text-sm font-medium">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-md disabled:bg-gray-400">{isLoading ? 'Guardando...' : 'Guardar'}</button>
                </div>
            </form>
        </div>
    );
};

// ====================================================================
// --- SECCIONES DEL DASHBOARD (Con lógica RBAC aplicada) ---
// ====================================================================

const DashboardSection = ({ session, showNotification }: any) => {
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    if (!session) return <div className="p-8 text-center">Cargando...</div>;

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const data = await getDashboardSummary(session);
                setSummary(data);
            } catch (error: any) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, [session, showNotification]);

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Facturación Hoy" value={`$${summary.totalRevenue.toFixed(2)}`} icon={<ChartBarIcon className="w-6 h-6" />} />
                    <KpiCard title="Transacciones" value={summary.totalSalesCount} icon={<DocumentTextIcon className="w-6 h-6" />} />
                    <KpiCard title="Puntos Canjeados" value={summary.totalPointsRedeemed.toLocaleString()} icon={<UsersIcon className="w-6 h-6" />} />
                </div>
            )}
        </div>
    );
};

const UserManagementSection = ({ showNotification, session }: any) => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await getUsers();
            // --- FILTRO RBAC ---
            const filteredUsers = allUsers.filter(u => {
                if (session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN) return true; // Ven todo
                if (session.role === ROLES.COORDINADOR) {
                    // Solo ven despachadores de SU estación
                    return u.role === ROLES.DESPACHADOR && u.stationId === session.stationId;
                }
                return false;
            });
            setUsers(filteredUsers);
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, session]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleEdit = (user: any) => {
        // Protección extra: Admin no edita Super Admin
        if (session.role === ROLES.ADMIN && user.role === ROLES.SUPER_ADMIN) {
            showNotification("Acceso denegado: No puede modificar al Super Admin.", "error");
            return;
        }
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (userData: any) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, userData);
                showNotification("Usuario actualizado.", "success");
            } else {
                await addUser(userData);
                showNotification("Usuario creado (Recuerde: Auth en Firebase).", "success");
            }
            setIsUserModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error: any) {
            showNotification(error.message, "error");
        }
    };

    return (
        <div className="animate-fade-in">
            {isUserModalOpen && <UserModal user={editingUser} onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} showNotification={showNotification} session={session} />}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Usuarios</h2>
                    <p className="text-sm text-gray-500">Gestión de personal y permisos.</p>
                </div>
                <button className="bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5" onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}>
                    <PlusIcon className="w-5 h-5" /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando usuarios...</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6">Rol</th>
                                <th className="py-4 px-6">Estación Asignada</th>
                                <th className="py-4 px-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 && (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No se encontraron usuarios bajo su supervisión.</td></tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{user.email}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                                            ${user.role === ROLES.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' : 
                                              user.role === ROLES.ADMIN ? 'bg-blue-100 text-blue-800' :
                                              user.role === ROLES.COORDINADOR ? 'bg-orange-100 text-orange-800' : 
                                              'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500">{user.stationId || <span className="text-gray-300 italic">Global</span>}</td>
                                    <td className="py-4 px-6 text-right">
                                        {/* Bloquear botón si es Admin intentando editar Super Admin */}
                                        {(session.role === ROLES.ADMIN && user.role === ROLES.SUPER_ADMIN) ? (
                                            <span className="text-xs text-gray-300 cursor-not-allowed">Protegido</span>
                                        ) : (
                                            <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Editar</button>
                                        )}
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

const SalesHistorySection = ({ session, showNotification }: any) => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ stationId: session.role === ROLES.COORDINADOR ? session.stationId : '', dispatcherId: '', paymentMethod: '', startDate: '', endDate: '' });
    const [stations, setStations] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (session.role === ROLES.ADMIN || session.role === ROLES.SUPER_ADMIN) {
                    const stationData = await getStations();
                    setStations(stationData);
                }
                const cleanFilters = { ...filters, startDate: filters.startDate ? new Date(filters.startDate) : null, endDate: filters.endDate ? new Date(filters.endDate) : null };
                const history = await getSalesHistory(cleanFilters, session);
                setSales(history);
            } catch (error: any) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [filters, session, showNotification]);

    const handleFilterChange = (e: any) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Historial de Ventas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <FilterInput label="Estación" name="stationId" value={filters.stationId || ''} onChange={handleFilterChange} type="select" disabled={session.role === ROLES.COORDINADOR}>
                    <option value="">Todas</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {session.role === ROLES.COORDINADOR && session.stationId && <option value={session.stationId}>Mi Estación</option>}
                </FilterInput>
                <FilterInput label="Despachador" name="dispatcherId" value={filters.dispatcherId} onChange={handleFilterChange} type="select">
                    <option value="">Todos</option>
                </FilterInput>
                <FilterInput label="Método Pago" name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} type="select">
                    <option value="">Todos</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Terminal">Terminal</option>
                    <option value="Puntos">Puntos</option>
                </FilterInput>
                <FilterInput label="Desde" name="startDate" value={filters.startDate} onChange={handleFilterChange} type="date" />
                <FilterInput label="Hasta" name="endDate" value={filters.endDate} onChange={handleFilterChange} type="date" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando historial...</p> : sales.length === 0 ? <p className="p-10 text-center text-gray-500">Sin resultados.</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr><th className="py-4 px-6">Fecha</th><th className="py-4 px-6">Cliente</th><th className="py-4 px-6">Estación</th><th className="py-4 px-6">Pago</th><th className="py-4 px-6">Total</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-4 px-6">{sale.date.toLocaleString('es-MX')}</td>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{sale.customerName}</td>
                                    <td className="py-4 px-6 text-gray-500">{sale.stationName || 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${sale.paymentMethod === 'puntos' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{sale.paymentMethod}</span>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-emerald-600">${sale.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const PriceAndProductSection = ({ showNotification }: any) => {
    const [gasPrices, setGasPrices] = useState({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ prices: true, products: true, save: false });
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [prices, prods] = await Promise.all([getGasPrices(), getProducts()]);
            if (prices) setGasPrices(prices);
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
        setGasPrices(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSavePrices = async () => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await updateGasPrices(gasPrices);
            showNotification('Precios actualizados.', 'success');
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleSaveProduct = async (productData: ProductData) => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            if (editingProduct && editingProduct.id) {
                await updateProduct(editingProduct.id, productData);
                showNotification('Producto actualizado.', 'success');
            } else {
                await addProduct(productData);
                showNotification('Producto agregado.', 'success');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchData();
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("¿Desactivar producto?")) return;
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await updateProduct(productId, { isActive: false });
            showNotification('Producto desactivado.', 'success');
            fetchData();
        } catch (error: any) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {isProductModalOpen && <ProductModal product={editingProduct} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} isLoading={isLoading.save} />}
            
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Precios de Combustible</h2>
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    {isLoading.prices ? <p>Cargando...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['magnaPrice', 'premiumPrice', 'dieselPrice'].map(type => (
                                <div key={type}>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 capitalize">{type.replace('Price', '')}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                                        <input type="number" step="0.01" name={type} value={gasPrices[type as keyof typeof gasPrices]} onChange={handlePriceChange} className="w-full pl-7 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-bold text-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSavePrices} disabled={isLoading.save} className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-lg transition-all">
                            {isLoading.save ? 'Guardando...' : 'Actualizar Precios'}
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Catálogo de Productos</h2>
                    <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow">
                        <PlusIcon className="w-5 h-5" /> Agregar
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
                    {products.map(prod => (
                        <div key={prod.id} className={`flex justify-between items-center p-4 mb-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all ${prod.isActive ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/20 opacity-75'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prod.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    <span className="font-bold text-lg">{prod.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{prod.name} {!prod.isActive && <span className="text-xs text-red-500 ml-2">(Inactivo)</span>}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">${prod.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingProduct(prod); setIsProductModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
interface AdminScreenProps {
    onBack: () => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    session: SessionData;
}

const Sidebar: React.FC<{ session: SessionData, activeSection: string, onSectionChange: (s: string) => void, onBack: () => void }> = ({ session, activeSection, onSectionChange, onBack }) => {
    if (!session) return null;

    const canSeeUsers = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN || session.role === ROLES.COORDINADOR;
    const canSeeStations = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;
    const canSeePrices = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN; // Solo IT/Super configuran precios globales

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, visible: true },
        { id: 'historial', label: 'Historial', icon: DocumentTextIcon, visible: true }, // Todos ven su historial
        { id: 'usuarios', label: 'Usuarios', icon: UsersIcon, visible: canSeeUsers },
        { id: 'estaciones', label: 'Estaciones', icon: BuildingOfficeIcon, visible: canSeeStations },
        { id: 'precios', label: 'Configuración', icon: CogIcon, visible: canSeePrices },
    ];

    return (
        <aside className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300">
            <div className="p-6 flex justify-center lg:justify-start items-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg lg:mr-3"></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden lg:block">Admin</h2>
            </div>
            
            <nav className="flex-grow px-4 space-y-2 mt-4">
                {navItems.filter(i => i.visible).map(item => (
                    <button key={item.id} onClick={() => onSectionChange(item.id)} className={`flex items-center justify-center lg:justify-start w-full gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${activeSection === item.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
                        <item.icon className={`w-6 h-6 ${activeSection === item.id ? 'text-white' : ''}`} />
                        <span className="font-medium hidden lg:block">{item.label}</span>
                        {activeSection === item.id && <div className="lg:hidden absolute left-0 w-1 h-8 bg-emerald-600 rounded-r-full"></div>}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onBack} className="flex items-center justify-center lg:justify-start w-full gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" /> 
                    <span className="font-medium hidden lg:block">Salir</span>
                </button>
            </div>
        </aside>
    );
};

export default function AdminScreen({ onBack, showNotification, session }: AdminScreenProps) {
    const [activeSection, setActiveSection] = useState('dashboard');

    // Guard clause
    if (!session) return <div className="flex h-screen items-center justify-center text-gray-500">Cargando sesión...</div>;

    // Redirección por defecto si el rol no permite ver la sección actual
    useEffect(() => {
        // Si un Coordinador intenta ver precios (bloqueado), moverlo a dashboard
        if (session.role === ROLES.COORDINADOR && (activeSection === 'precios' || activeSection === 'estaciones')) {
            setActiveSection('dashboard');
        }
    }, [session.role, activeSection]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex font-sans">
            <Sidebar session={session} activeSection={activeSection} onSectionChange={setActiveSection} onBack={onBack} />
            
            <main className="flex-grow p-6 lg:p-10 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto">
                    {activeSection === 'dashboard' && <DashboardSection session={session} showNotification={showNotification} />}
                    {activeSection === 'historial' && <SalesHistorySection session={session} showNotification={showNotification} />}
                    {activeSection === 'usuarios' && <UserManagementSection showNotification={showNotification} session={session} />}
                    {activeSection === 'estaciones' && <StationManagementSection showNotification={showNotification} />}
                    {activeSection === 'precios' && <PriceAndProductSection showNotification={showNotification} />}
                </div>
            </main>
        </div>
    );
}