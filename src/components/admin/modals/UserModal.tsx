// src/components/admin/modals/UserModal.tsx
import React, { useState, useEffect } from 'react';
import { ROLES } from '../../constants/roles'; 
import { SessionData, UserData, StationData } from '../../../types'; 

interface UserModalProps {
    user: UserData | null;
    stations: StationData[]; // PROPIEDAD: Lista de estaciones disponibles (obtenida de UserManagementSection)
    onClose: () => void;
    onSave: (userData: Partial<UserData>) => Promise<void>;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    session: SessionData;
}

const UserModal: React.FC<UserModalProps> = ({ user, stations, onClose, onSave, showNotification, session }) => {
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

    // 1. Si es Coordinador, la estación se fija automáticamente a su propia estación
    useEffect(() => {
        if (session.role === ROLES.COORDINADOR) {
            setStationId(session.stationId || '');
        }
    }, [session]);
    
    // 2. Comprobación de que el stationId actual es válido si el rol requiere una estación
    useEffect(() => {
        const stationRequired = role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN;
        
        // Si el rol requiere estación y el valor actual no está en la lista de estaciones, lo reseteamos
        // Esto solo se aplica si la lista de estaciones ya se cargó (stations.length > 0)
        if (stationRequired && stations.length > 0 && stationId && !stations.some(s => s.id === stationId)) {
             // Podríamos resetear el valor, pero si es edición lo mantenemos para no perder datos.
             // Para la creación, la opción por defecto es "Seleccione una estación".
        }
    }, [stations, role, stationId]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !role) {
            showNotification("Email y Rol son requeridos.", "error");
            return;
        }
        
        const stationRequired = role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN;

        // 3. Validación: Si el rol REQUIERE estación y no se ha seleccionado ninguna
        if (stationRequired && !stationId) {
            showNotification("Debe asignar una Estación a Coordinadores y Despachadores.", "error");
            return;
        }

        onSave({ email, role, stationId });
    };
    
    // 4. Determina si el campo de estación debe ser visible
    const isStationRequired = role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN;
    
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

                    {/* CAMPO DE ESTACIÓN - AHORA ES SELECT DINÁMICO */}
                    {isStationRequired && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seleccionar Estación</label>
                            <select 
                                value={stationId} 
                                onChange={(e) => setStationId(e.target.value)} 
                                required={isStationRequired}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                disabled={session.role === ROLES.COORDINADOR} // Bloquear si es Coordinador
                            >
                                <option value="" disabled>-- Seleccione una estación --</option>
                                {/* Mapeo dinámico de estaciones */}
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>{station.name} ({station.id})</option>
                                ))}
                            </select>
                            {session.role === ROLES.COORDINADOR && <p className="text-xs text-gray-400 mt-1">Fijo a su estación asignada.</p>}
                            {stations.length === 0 && <p className="text-xs text-red-500 mt-1">Advertencia: No hay estaciones disponibles.</p>}
                        </div>
                    )}
                    
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors font-medium text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg">Guardar Usuario</button>
                </div>
            </form>
        </div>
    );
};

export default UserModal;