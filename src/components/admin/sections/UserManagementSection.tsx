// src/components/admin/sections/UserManagementSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, addUser, updateUser } from '../../../services/adminService';
import UserModal from '../modals/UserModal';
import { ROLES } from '../../constants/roles'; 
import { SessionData, UserData } from '../../../types';
import { PlusIcon, PencilIcon } from '../../Icons'; // Asume que moviste los iconos aquí

interface UserManagementSectionProps {
    session: SessionData;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({ showNotification, session }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

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

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

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

export default UserManagementSection;