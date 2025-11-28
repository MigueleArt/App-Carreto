// src/components/admin/modals/ProductModal.tsx
import React, { useState } from 'react';
import { ProductData } from '../../../types';

interface ProductModalProps {
    product: ProductData | null;
    onClose: () => void;
    onSave: (productData: ProductData) => Promise<void>;
    isLoading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState(product || { name: '', price: '', barcode: '', department: '', isActive: true });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;
        const checked = target.checked;

        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Usamos la prop window.alert() para evitar problemas con confirm()
        if (!formData.name || !formData.price) { window.alert('Nombre y Precio requeridos.'); return; }
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

export default ProductModal;