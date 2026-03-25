import React from 'react';
import { ROLES } from '../../constants/roles';
import { SessionData } from '../../../types';

// Importaciones de iconos
import {
    ChartBarIcon, UsersIcon, BuildingOfficeIcon, CogIcon, ArrowLeftIcon,
    DocumentTextIcon, TerminalIcon,
    ShoppingBagIcon, TagIcon, GiftIcon
} from '../../Icons';

interface SidebarProps {
    session: SessionData;
    activeSection: string;
    onSectionChange: (s: string) => void;
    onBack: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ session, activeSection, onSectionChange, onBack, isOpen = false, onClose }) => {
    if (!session) return null;

    // Lógica de permisos (RBAC)
    const canSeeUsers = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN || session.role === ROLES.COORDINADOR;
    const canSeeStations = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;
    const canSeePrices = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;
    const canSeeTerminals = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;
    const canManageClub = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, visible: true },
        { id: 'historial', label: 'Historial', icon: DocumentTextIcon, visible: true },
        { id: 'usuarios', label: 'Usuarios', icon: UsersIcon, visible: canSeeUsers },
        { id: 'estaciones', label: 'Estaciones', icon: BuildingOfficeIcon, visible: canSeeStations },
        { id: 'terminales', label: 'Terminales', icon: TerminalIcon, visible: canSeeTerminals },
        { id: 'precios', label: 'Configuración', icon: CogIcon, visible: canSeePrices },
    ];

    // Nueva sección Club Pilotos
    const clubItems = [
        { id: 'tienda', label: 'Tienda', icon: ShoppingBagIcon, visible: canManageClub },
        { id: 'promociones', label: 'Promociones', icon: TagIcon, visible: canManageClub },
        { id: 'niveles', label: 'Niveles y Premios', icon: GiftIcon, visible: canManageClub },
    ];

    const renderNavButton = (item: any) => (
        <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center justify-start w-full gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${activeSection === item.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
        >
            <item.icon className={`w-6 h-6 ${activeSection === item.id ? 'text-white' : ''}`} />
            <span className="font-medium block">{item.label}</span>
        </button>
    );

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo y Botón de cerrar en móvil */}
                <div className="p-6 flex justify-between items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:bg-transparent lg:border-none">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg mr-3"></div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin</h2>
                    </div>
                    {/* Botón X solo visible en móvil */}
                    <button 
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <nav className="flex-grow px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide pb-6">
                    {/* Enlaces Principales */}
                    {navItems.filter(i => i.visible).map(renderNavButton)}

                    {/* Separador y Título de Club Pilotos */}
                    {canManageClub && (
                        <div className="pt-4 pb-1">
                            <p className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Club Pilotos
                            </p>
                        </div>
                    )}

                    {/* Enlaces de Club Pilotos */}
                    {clubItems.filter(i => i.visible).map(renderNavButton)}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-900 lg:bg-transparent">
                    <button onClick={onBack} className="flex items-center justify-start w-full gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="font-medium">Salir</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;