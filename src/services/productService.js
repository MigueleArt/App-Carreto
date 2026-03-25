import { db } from '../firebaseConfig'; 
import { collection, query, where, getDocs, limit } from "firebase/firestore";

/**
 * Trae los productos activos por defecto para mostrar al abrir el catálogo
 */
export const getActiveProducts = async () => {
    try {
        const productsColRef = collection(db, "products");
        // Traemos hasta 50 productos activos para mostrar inicialmente
        const q = query(productsColRef, where("isActive", "==", true), limit(50));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error obteniendo productos activos: ", error);
        return [];
    }
};

/**
 * Busca productos activos en Firestore por nombre o código de barras.
 */
export const searchProducts = async (searchText) => {
    if (!searchText || searchText.trim() === '') {
        return [];
    }
    
    const productsColRef = collection(db, "products");
    const searchQuery = searchText.toLowerCase(); 

    // Intenta buscar por código de barras primero (más eficiente)
    const barcodeQuery = query(productsColRef,
        where("isActive", "==", true),
        where("barcode", "==", searchText),
        limit(10)
    );

    try {
        const barcodeSnapshot = await getDocs(barcodeQuery);
        if (!barcodeSnapshot.empty) {
            return barcodeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // --- Filtro manual "contiene" ---
            console.warn("Realizando filtro manual 'contiene' para productos.");
            const allProductsQuery = query(productsColRef, where("isActive", "==", true));
            const allDocsSnapshot = await getDocs(allProductsQuery);
            const productList = allDocsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                // CORRECCIÓN AQUÍ: Eliminamos ": any" para que sea válido en .js
                .filter(prod => prod.name && prod.name.toLowerCase().includes(searchQuery)) 
                .slice(0, 10); // Limitar resultados
            return productList;
        }
    } catch (error) {
        console.error("Error buscando productos: ", error);
        throw new Error("No se pudieron buscar los productos.");
    }
};