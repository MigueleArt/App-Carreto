// src/components/admin/sections/UserManagementSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, addUser, updateUser, deleteUser, getStations } from '../../../services/adminService';
import UserModal from '../modals/UserModal';
import { ROLES } from '../../constants/roles'; 
import { SessionData, UserData, StationData } from '../../../types'; // Importamos StationData
import { PlusIcon, PencilIcon, TrashIcon } from '../../Icons'; 

interface UserManagementSectionProps {
    session: SessionData;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({ showNotification, session }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [stations, setStations] = useState<StationData[]>([]); // NUEVO: Estado para las estaciones
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStations, setIsLoadingStations] = useState(true); // NUEVO: Estado de carga para estaciones
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null, name: string}>({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // Función para obtener la lista de usuarios (sin cambios relevantes)
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await getUsers();
            const filteredUsers = allUsers.filter(u => {
                if (session.role === ROLES.SUPER_ADMIN || session.role === ROLES.ADMIN) return true;
                if (session.role === ROLES.COORDINADOR) {
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

    // NUEVO: Función para obtener la lista de estaciones
    const fetchStations = useCallback(async () => {
        setIsLoadingStations(true);
        try {
            const stationList = await getStations();
            setStations(stationList);
        } catch (error: any) {
            showNotification("Error al cargar estaciones: " + error.message, 'error');
        } finally {
            setIsLoadingStations(false);
        }
    }, [showNotification]);

    useEffect(() => { 
        fetchUsers(); 
        fetchStations(); // Llamamos a la función de estaciones al montar
    }, [fetchUsers, fetchStations]);

    const handleEdit = (user: UserData) => {
        if (session.role === ROLES.ADMIN && user.role === ROLES.SUPER_ADMIN) {
            showNotification("Acceso denegado: No puede modificar al Super Admin.", "error");
            return;
        }
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (userData: Partial<UserData>) => {
        try {
            if (editingUser && editingUser.id) {
                await updateUser(editingUser.id, userData);
                showNotification("Usuario actualizado.", "success");
            } else {
                await addUser(userData as UserData);
                showNotification("Usuario creado exitosamente.", "success");
            }
            setIsUserModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error: any) {
            showNotification(error.message, "error");
        }
    };

    const handleDeleteClick = (user: UserData) => {
        if (session.role === ROLES.ADMIN && user.role === ROLES.SUPER_ADMIN) {
            showNotification("Acceso denegado: No puede eliminar al Super Admin.", "error");
            return;
        }
        setDeleteConfirm({ isOpen: true, id: user.id || null, name: user.name || user.email });
    };

    const confirmDeleteUser = async () => {
        if (!deleteConfirm.id) return;
        setIsDeleting(true);
        try {
            await deleteUser(deleteConfirm.id);
            showNotification("Usuario eliminado correctamente.", "success");
            fetchUsers();
        } catch (error: any) {
            showNotification(error.message, "error");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    // Unimos los estados de carga para el botón de "Nuevo Usuario"
    const isReady = !isLoading && !isLoadingStations;

    // Helper para obtener el nombre de la estación por su ID
    const getStationName = (stationId?: string) => {
        if (!stationId) return null;
        const station = stations.find(s => s.id === stationId);
        return station ? station.name : stationId;
    };

    return (
        <div className="animate-fade-in">
            {isUserModalOpen && (
                <UserModal 
                    user={editingUser} 
                    stations={stations} // PASAMOS LA LISTA DE ESTACIONES AL MODAL
                    onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }} 
                    onSave={handleSaveUser} 
                    showNotification={showNotification} 
                    session={session} 
                />
            )}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Usuarios</h2>
                    <p className="text-sm text-gray-500">Gestión de personal y permisos.</p>
                </div>
                <button 
                    className="bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 disabled:bg-gray-400" 
                    onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                    disabled={!isReady} // Deshabilitar si aún se están cargando los datos
                >
                    <PlusIcon className="w-5 h-5" /> {isLoadingStations ? 'Cargando Estaciones...' : 'Nuevo Usuario'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
                {isLoading ? <p className="p-10 text-center text-gray-500">Cargando usuarios...</p> : (
                    <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400 min-w-[540px]">
                        <thead className="text-[10px] sm:text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="py-3 px-3 sm:px-6">Nombre</th>
                                <th className="py-3 px-3 sm:px-6">Email</th>
                                <th className="py-3 px-3 sm:px-6">Rol</th>
                                <th className="py-3 px-3 sm:px-6">Estación</th>
                                <th className="py-3 px-3 sm:px-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No se encontraron usuarios bajo su supervisión.</td></tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="py-3 px-3 sm:px-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name || <span className="text-gray-300 italic">Sin nombre</span>}</td>
                                    <td className="py-3 px-3 sm:px-6 text-gray-500 truncate max-w-[150px] sm:max-w-none">{user.email}</td>
                                    <td className="py-3 px-3 sm:px-6">
                                        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap
                                            ${user.role === ROLES.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' : 
                                                user.role === ROLES.ADMIN ? 'bg-blue-100 text-blue-800' :
                                                user.role === ROLES.COORDINADOR ? 'bg-orange-100 text-orange-800' : 
                                                'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 sm:px-6 text-gray-500 whitespace-nowrap">{getStationName(user.stationId) || <span className="text-gray-300 italic">Global</span>}</td>
                                    <td className="py-3 px-3 sm:px-6 text-right">
                                        {(session.role === ROLES.ADMIN && user.role === ROLES.SUPER_ADMIN) ? (
                                            <span className="text-xs text-gray-300 cursor-not-allowed">Protegido</span>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Editar">
                                                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(user)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Eliminar">
                                                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Confirmación Eliminar Usuario */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrashIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">¿Eliminar usuario?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Estás a punto de eliminar a:
                        </p>
                        <p className="text-gray-800 dark:text-white font-semibold mb-4">{deleteConfirm.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Esta acción eliminará el perfil del usuario del sistema. No se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })} 
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDeleteUser} 
                                disabled={isDeleting}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-red-500/30 font-semibold disabled:opacity-50 disabled:shadow-none"
                            >
                                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementSection;