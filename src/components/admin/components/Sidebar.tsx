// src/components/admin/components/Sidebar.tsx
import React from 'react';
import { ROLES } from '../../constants/roles'; 
import { SessionData } from '../../../types'; // Asegúrate de tener este archivo y tipo
// NOTA: Debes mover la definición de todos tus iconos a src/components/Icons.tsx

// Importaciones de iconos (asumiendo que los moviste a un archivo central de Iconos)
import { 
    ChartBarIcon, UsersIcon, BuildingOfficeIcon, CogIcon, ArrowLeftIcon, 
    DocumentTextIcon 
} from '../../Icons'; 

interface SidebarProps {
    session: SessionData;
    activeSection: string;
    onSectionChange: (s: string) => void;
    onBack: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ session, activeSection, onSectionChange, onBack }) => {
    if (!session) return null;

    const canSeeUsers = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN || session.role === ROLES.COORDINADOR;
    const canSeeStations = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN;
    const canSeePrices = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN; 

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, visible: true },
        { id: 'historial', label: 'Historial', icon: DocumentTextIcon, visible: true },
        { id: 'usuarios', label: 'Usuarios', icon: UsersIcon, visible: canSeeUsers },
        { id: 'estaciones', label: 'Estaciones', icon: BuildingOfficeIcon, visible: canSeeStations },
        { id: 'precios', label: 'Configuración', icon: CogIcon, visible: canSeePrices },
    ];

    return (
        <aside className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0">
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

export default Sidebar;