import React, { useState, useEffect } from 'react';
// Asegúrate que las importaciones apunten a tus archivos reales de servicios
import { getGasPrices, updateGasPrices, getProducts, addProduct, updateProduct, deleteProduct } from '../../services/adminService'; 

// --- Iconos ---
const ArrowLeftIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" /></svg>;
const CogIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.178-2.034A1.875 1.875 0 0 0 14.922 2.25h-3.844Zm-1.87 1.125a.75.75 0 0 1 .75-.75h.008l.008.002a.75.75 0 0 1 .742.748l.178 2.034a3 3 0 0 1-1.897 3.272l-2.148.81a.75.75 0 0 1-.74-.004l-2.148-.81a3 3 0 0 1-1.897-3.272l.178-2.034a.75.75 0 0 1 .748-.748l.008-.002h.008a.75.75 0 0 1 .75.75v.008c0 .04-.002.079-.005.118l-.34 1.558a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.34-1.558a.754.754 0 0 1-.005-.118v-.008Zm1.144 11.625c-.917 0-1.699.663-1.85 1.567l-.178 2.034a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.178-2.034a1.875 1.875 0 0 0-1.85-1.567h-3.844Zm1.125 1.875a.75.75 0 0 1 .75-.75h.008l.008.002a.75.75 0 0 1 .742.748l.178 2.034a3 3 0 0 1-1.897 3.272l-2.148.81a.75.75 0 0 1-.74-.004l-2.148-.81a3 3 0 0 1-1.897-3.272l.178-2.034a.75.75 0 0 1 .748-.748l.008-.002h.008a.75.75 0 0 1 .75.75v.008c0 .04-.002.079-.005.118l-.34 1.558a1.5 1.5 0 0 0 .948 1.636l2.148.81c.48.182.997.182 1.477 0l2.148-.81a1.5 1.5 0 0 0 .948-1.636l-.34-1.558a.754.754 0 0 1-.005-.118v-.008Z" clipRule="evenodd" /></svg>;
const PlusIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>;
const PencilIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" /></svg>;
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>;

// --- Componente Modal para Productos ---
const ProductModal = ({ product, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState(product || { name: '', price: '', barcode: '', department: '', isActive: true });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            alert('Nombre y Precio son requeridos.');
            return;
        }
        onSave({
            ...formData,
            price: parseFloat(formData.price) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"> {/* Añadido p-4 para evitar que el modal toque bordes en móvil */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl m-4 w-full max-w-lg"> {/* Quitada altura fija, margen añadido */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 px-8 pt-8"> {/* Padding ajustado */}
                    {product ? 'Editar' : 'Agregar'} Producto
                </h2>
                <div className="space-y-4 px-8 pb-6"> {/* Padding ajustado */}
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del producto" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Precio ($)" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    <input name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Código de Barras (opcional)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    <input name="department" value={formData.department} onChange={handleChange} placeholder="Departamento (opcional)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"/>
                        Activo (visible en POS)
                    </label>
                </div>
                <div className="flex gap-4 mt-4 px-8 pb-8 border-t border-gray-200 dark:border-gray-700 pt-6"> {/* Padding y borde ajustados */}
                    <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors">
                        {isLoading ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};


export default function AdminScreen({ onBack, showNotification }) {
    // Estado local para los precios de la gasolina
    const [gasPrices, setGasPrices] = useState({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
    // Estado local para la lista de productos
    const [products, setProducts] = useState([]);
    // Estado para controlar los indicadores de carga (precios, productos, guardado)
    const [isLoading, setIsLoading] = useState({ prices: true, products: true, save: false }); // Inicia cargando
    // Estado para controlar la visibilidad del modal de productos
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    // Estado para guardar el producto que se está editando (o null si es uno nuevo)
    const [editingProduct, setEditingProduct] = useState(null); 

    // --- Carga de Datos Inicial ---
    useEffect(() => {
        // Función asíncrona para cargar los datos cuando el componente se monta
        const fetchData = async () => {
            // Activa los indicadores de carga para precios y productos
            setIsLoading(prev => ({ ...prev, prices: true, products: true }));
            let pricesLoaded = false; // Bandera para saber si se cargaron precios
            try {
                // LLAMA A LA FUNCIÓN REAL para obtener precios desde adminService
                const fetchedPrices = await getGasPrices(); 
                if (fetchedPrices) {
                    // Actualiza el estado local con los precios obtenidos
                    setGasPrices({
                        magnaPrice: fetchedPrices.magnaPrice || 0,
                        premiumPrice: fetchedPrices.premiumPrice || 0,
                        dieselPrice: fetchedPrices.dieselPrice || 0
                    });
                    pricesLoaded = true; // Marca que se cargaron
                } else {
                    // Muestra notificación si getGasPrices devolvió null (documento no encontrado)
                    showNotification('Error: No se encontró el documento de configuración de precios.', 'error');
                }
                
                // LLAMA A LA FUNCIÓN REAL para obtener productos desde adminService
                const fetchedProducts = await getProducts();
                // Actualiza el estado local con la lista de productos
                setProducts(fetchedProducts || []); // Usa un array vacío si hay error

            } catch (error) {
                // Muestra notificación si ocurre cualquier otro error durante la carga
                showNotification(`Error al cargar datos iniciales: ${error.message}`, 'error');
                // Opcional: Establecer valores por defecto si falla la carga
                if (!pricesLoaded) setGasPrices({ magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 });
                setProducts([]);
            } finally {
                // Desactiva los indicadores de carga independientemente del resultado
                setIsLoading(prev => ({ ...prev, prices: false, products: false }));
            }
        };
        fetchData(); // Ejecuta la función de carga
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []); // Array de dependencias vacío para ejecutar solo al montar

    // --- Manejadores de Eventos ---

    // Actualiza el estado local cuando cambia un input de precio
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setGasPrices(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0 // Convierte a número, usa 0 si no es válido
        }));
    };

    // Guarda los precios modificados en Firebase
    const handleSavePrices = async () => {
        setIsLoading(prev => ({ ...prev, save: true })); // Activa indicador de guardado
        try {
            // LLAMA A LA FUNCIÓN REAL para actualizar precios en Firebase
            await updateGasPrices(gasPrices);
            showNotification('Precios de gasolina actualizados.', 'success');
        } catch (error) {
            showNotification(`Error al guardar los precios: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false })); // Desactiva indicador de guardado
        }
    };

    // Abre el modal para agregar o editar un producto
    const openProductModal = (product = null) => {
        setEditingProduct(product); // Guarda el producto a editar (o null si es nuevo)
        setIsProductModalOpen(true); // Muestra el modal
    };

    // Guarda un producto (nuevo o editado) en Firebase
    const handleSaveProduct = async (productData) => {
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            if (editingProduct) { // Si estamos editando...
                // LLAMA A LA FUNCIÓN REAL para actualizar producto
                await updateProduct(editingProduct.id, productData);
                // Actualiza la lista local de productos (actualización optimista)
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { id: p.id, ...productData } : p)); 
                showNotification('Producto actualizado.', 'success');
            } else { // Si estamos agregando...
                // LLAMA A LA FUNCIÓN REAL para agregar producto
                const newProduct = await addProduct(productData);
                // Añade el nuevo producto (con el ID devuelto por Firebase) a la lista local
                setProducts(prev => [...prev, newProduct]); 
                showNotification('Producto agregado.', 'success');
            }
            setIsProductModalOpen(false); // Cierra el modal
            setEditingProduct(null); // Limpia el estado de edición
        } catch (error) {
            showNotification(`Error al guardar producto: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    // Marca un producto como inactivo en Firebase
    const handleDeleteProduct = async (productId) => {
        // Pide confirmación al usuario
        if (!window.confirm("¿Seguro que quieres marcar este producto como inactivo? No se borrará permanentemente.")) return;
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            // LLAMA A LA FUNCIÓN REAL para marcar como inactivo
            await updateProduct(productId, { isActive: false });
            // Actualiza la lista local (actualización optimista)
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: false } : p)); 
            showNotification('Producto marcado como inactivo.', 'success');
        } catch (error) {
            showNotification(`Error al desactivar producto: ${error.message}`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    // --- Renderizado del Componente ---
    return (
        <>
            {/* Renderiza el modal de producto si está abierto */}
            {isProductModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={handleSaveProduct}
                    isLoading={isLoading.save}
                />
            )}

            {/* Contenedor principal del panel */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in">
                {/* Cabecera del panel */}
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 ml-4 flex items-center gap-2">
                        <CogIcon className="w-6 h-6"/> Panel de Administración
                    </h2>
                </div>

                {/* Sección Precios Gasolina */}
                <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Precios de Combustible</h3>
                    {/* Muestra "Cargando..." o los inputs de precios */}
                    {isLoading.prices ? <p className="text-gray-500 dark:text-gray-400">Cargando precios...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Input para Magna */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Magna ($)</label>
                                <input type="number" step="0.01" name="magnaPrice" value={gasPrices.magnaPrice} onChange={handlePriceChange} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md"/>
                            </div>
                            {/* Input para Premium */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Premium ($)</label>
                                <input type="number" step="0.01" name="premiumPrice" value={gasPrices.premiumPrice} onChange={handlePriceChange} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md"/>
                            </div>
                            {/* Input para Diésel */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diésel ($)</label>
                                <input type="number" step="0.01" name="dieselPrice" value={gasPrices.dieselPrice} onChange={handlePriceChange} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md"/>
                            </div>
                        </div>
                    )}
                    {/* Botón para guardar precios */}
                    <button onClick={handleSavePrices} disabled={isLoading.save || isLoading.prices} className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isLoading.save ? 'Guardando...' : 'Guardar Precios'}
                    </button>
                </div>

                {/* Sección Productos */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Cabecera de la sección de productos */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Productos Generales</h3>
                        <button onClick={() => openProductModal()} className="flex items-center gap-1 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700">
                            <PlusIcon className="w-5 h-5"/> Agregar
                        </button>
                    </div>
                    {/* Muestra "Cargando..." o la lista de productos */}
                    {isLoading.products ? <p className="text-gray-500 dark:text-gray-400">Cargando productos...</p> : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {/* Contenedor con scroll */}
                           {/* Mensaje si no hay productos */}
                           {products.length === 0 && <p className="text-center text-gray-500 py-4">No hay productos registrados.</p>}
                           {/* Mapea y muestra cada producto */}
                           {products.map(prod => (
                               <div key={prod.id} className={`flex justify-between items-center p-3 rounded-lg ${prod.isActive ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-red-50 dark:bg-red-900/30 opacity-60'}`}>
                                   <div>
                                       {/* Nombre y estado */}
                                       <p className="font-semibold text-gray-800 dark:text-gray-200">{prod.name} {!prod.isActive && '(Inactivo)'}</p>
                                       {/* Detalles del producto */}
                                       <p className="text-sm text-gray-500 dark:text-gray-400">
                                            ${prod.price.toFixed(2)} {prod.barcode && `| ${prod.barcode}`} {prod.department && `| ${prod.department}`}
                                       </p>
                                   </div>
                                   {/* Botones de acción (Editar y Desactivar) */}
                                   <div className="flex gap-2 flex-shrink-0">
                                       <button onClick={() => openProductModal(prod)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded">
                                           <PencilIcon className="w-5 h-5"/>
                                       </button>
                                       <button onClick={() => handleDeleteProduct(prod.id)} disabled={isLoading.save} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded disabled:opacity-50">
                                           <TrashIcon className="w-5 h-5"/>
                                       </button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}


