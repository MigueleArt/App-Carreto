import React, { useState, useEffect } from 'react';
import { SessionData } from '../../types'; 
// RUTA CORREGIDA FINAL (Asumiendo src/components/constants/roles.ts)
import { ROLES } from '../constants/roles'; 
// 1. Importaciones de la nueva estructura modular
import Sidebar from '../admin/components/Sidebar';
import DashboardSection from '../admin/sections/DashboardSection';
import UserManagementSection from '../admin/sections/UserManagementSection';
import StationManagementSection from '../admin/sections/StationManagementSection';
import SalesHistorySection from '../admin/sections/SalesHistorySection';
import PriceAndProductSection from '../admin/sections/PriceAndProductSection';
import TerminalConfigSection from '../admin/sections/TerminalConfigSection';

// Nuevas importaciones para Club Pilotos (Deberás crear estos archivos)
import TiendaSection from '../admin/sections/TiendaSection';
import PromocionesSection from '../admin/sections/PromocionesSection';
import NivelesSection from '../admin/sections/NivelesSection';

interface AdminScreenProps {
    onBack: () => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    session: SessionData;
}

export default function AdminScreen({ onBack, showNotification, session }: AdminScreenProps) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!session) return <div className="flex h-screen items-center justify-center text-gray-500">Cargando sesión...</div>;

    // Lógica de Redirección RBAC
    useEffect(() => {
        if (session.role === ROLES.COORDINADOR && (activeSection === 'precios' || activeSection === 'estaciones' || activeSection === 'terminales')) {
            setActiveSection('dashboard');
        }
    }, [session.role, activeSection]);

    // Función que renderiza la sección activa
    const renderSection = () => {
        const props = { session, showNotification };
        switch (activeSection) {
            case 'dashboard':
                return <DashboardSection {...props} />;
            case 'historial':
                return <SalesHistorySection {...props} />;
            case 'usuarios':
                return <UserManagementSection {...props} />;
            case 'estaciones':
                return <StationManagementSection showNotification={showNotification} />;
            case 'terminales':
                return <TerminalConfigSection showNotification={showNotification} />;
            case 'precios':
                return <PriceAndProductSection showNotification={showNotification} />;
            
            // --- Nuevas Rutas de Club Pilotos ---
            case 'tienda':
                return <TiendaSection {...props} />;
            case 'promociones':
                return <PromocionesSection {...props} />;
            case 'niveles':
                return <NivelesSection {...props} />;
            // ------------------------------------

            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col lg:flex-row font-sans">
            {/* Cabecera Móvil (solo visible en pantallas pequeñas) */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 relative">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-600 rounded-md"></div>
                        <span className="font-bold text-lg text-gray-800 dark:text-white">Admin</span>
                    </div>
                </div>
                <button onClick={onBack} className="text-red-500 font-medium text-sm px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    Salir
                </button>
            </div>

            <Sidebar 
                session={session} 
                activeSection={activeSection} 
                onSectionChange={(section) => {
                    setActiveSection(section);
                    setIsSidebarOpen(false); // Cierra el menú al seleccionar en móvil
                }} 
                onBack={onBack} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            
            <main className="flex-grow p-4 lg:p-10 overflow-y-auto h-screen lg:h-auto">
                <div className="max-w-6xl mx-auto">
                    {renderSection()}
                </div>
            </main>
        </div>
    );
}