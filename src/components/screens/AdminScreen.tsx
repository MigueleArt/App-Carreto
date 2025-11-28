// src/components/screens/AdminScreen.tsx
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

interface AdminScreenProps {
    onBack: () => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    session: SessionData;
}

export default function AdminScreen({ onBack, showNotification, session }: AdminScreenProps) {
    const [activeSection, setActiveSection] = useState('dashboard');

    if (!session) return <div className="flex h-screen items-center justify-center text-gray-500">Cargando sesión...</div>;

    // Lógica de Redirección RBAC
    useEffect(() => {
        if (session.role === ROLES.COORDINADOR && (activeSection === 'precios' || activeSection === 'estaciones')) {
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
            case 'precios':
                return <PriceAndProductSection showNotification={showNotification} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex font-sans">
            <Sidebar session={session} activeSection={activeSection} onSectionChange={setActiveSection} onBack={onBack} />
            
            <main className="flex-grow p-6 lg:p-10 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto">
                    {renderSection()}
                </div>
            </main>
        </div>
    );
}