import React, { useState } from 'react';
import { ProductData } from '../../../types';

interface ProductModalProps {
    product: ProductData | null;
    onClose: () => void;
    onSave: (productData: ProductData) => Promise<void>;
    isLoading: boolean;
}

/**
 * ProductModal
 * Componente para crear o editar productos del catálogo.
 * Diseño optimizado para mayor legibilidad y consistencia visual.
 */
const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave, isLoading }) => {
    // Inicialización del estado del formulario
    const [formData, setFormData] = useState<any>(product || { 
        name: '', 
        price: '', 
        barcode: '', 
        department: '', 
        isActive: true 
    });
    
    // Manejador único para cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev: any) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };
    
    // Validación y envío de datos
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica de campos obligatorios
        if (!formData.name.trim() || !formData.price) { 
            window.alert('Por favor, ingresa el Nombre y el Precio del producto.'); 
            return; 
        }

        // Aseguramos que el precio sea un número válido antes de guardar
        const finalPrice = parseFloat(String(formData.price)) || 0;
        onSave({ ...formData, price: finalPrice });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <form 
                onSubmit={handleSubmit} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700"
            >
                {/* Cabecera del Modal */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                        Información del Catálogo
                    </p>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Campo: Nombre */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Nombre del Producto</label>
                        <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="Ej. Aceite Multigrado" 
                            required 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Campo: Precio */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Precio ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input 
                                    name="price" 
                                    type="number" 
                                    step="0.01" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    placeholder="0.00" 
                                    required 
                                    className="w-full pl-8 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white" 
                                />
                            </div>
                        </div>

                        {/* Campo: Código de Barras */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Código de Barras</label>
                            <input 
                                name="barcode" 
                                value={formData.barcode} 
                                onChange={handleChange} 
                                placeholder="Opcional" 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white" 
                            />
                        </div>
                    </div>

                    {/* Campo: Departamento */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Departamento / Categoría</label>
                        <input 
                            name="department" 
                            value={formData.department} 
                            onChange={handleChange} 
                            placeholder="Ej. Lubricantes, Aditivos..." 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white" 
                        />
                    </div>

                    {/* Checkbox: Estado Activo */}
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors border border-dashed border-gray-200 dark:border-gray-600">
                        <input 
                            name="isActive" 
                            type="checkbox" 
                            checked={formData.isActive} 
                            onChange={handleChange} 
                            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" 
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">Producto Activo</span>
                            <span className="text-[10px] text-gray-400 uppercase">Visible en el punto de venta</span>
                        </div>
                    </label>
                </div>

                {/* Footer del Modal */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:bg-gray-400 disabled:shadow-none"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default ProductModal;