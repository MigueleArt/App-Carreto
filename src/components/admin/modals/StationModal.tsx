// src/components/admin/modals/StationModal.tsx
import React, { useState } from 'react';

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

export default StationModal;