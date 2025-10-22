// Ruta confirmada como correcta ya que firebaseConfig está en src/
import { db } from '../firebaseConfig'; // Importa TU instancia de Firestore
import { collection, query, where, getDocs, limit, or, orderBy, startAt, endAt } from "firebase/firestore";

/**
 * Busca productos activos en Firestore por nombre (que empiece con, insensible a mayúsculas) o código de barras (exacto).
 * ¡Requiere crear índices en Firestore para búsquedas eficientes!
 * @param {string} searchText - Texto de búsqueda (nombre o código de barras).
 * @returns {Promise<Array<object>>} Array de productos encontrados.
 */
export const searchProducts = async (searchText) => {
    if (!searchText || searchText.trim() === '') {
        return [];
    }
    
    const productsColRef = collection(db, "products");
    const searchQuery = searchText.toLowerCase(); // Convertir a minúsculas para búsqueda insensible
    const searchQueryEnd = searchQuery + '\uf8ff'; // Caracter Unicode alto para consultas 'empieza con'

    // Intenta buscar por código de barras primero (más eficiente)
    const barcodeQuery = query(productsColRef,
        where("isActive", "==", true),
        where("barcode", "==", searchText),
        limit(10)
    );

    try {
        const barcodeSnapshot = await getDocs(barcodeQuery);
        if (!barcodeSnapshot.empty) {
            // Si encontró por barcode, devuelve esos resultados
            return barcodeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // Si no encontró por barcode, busca por nombre (empieza con, insensible)
            // Para esto, necesitarías un campo 'nameLowercase' en tus documentos de producto
            // y crear un índice compuesto en Firestore: (isActive == true, nameLowercase ASC)
            /*
            // Ejemplo con campo 'nameLowercase':
            const nameQuery = query(productsColRef,
                where("isActive", "==", true),
                orderBy("nameLowercase"), // Ordena por el campo en minúsculas
                startAt(searchQuery),     // Empieza en el texto de búsqueda
                endAt(searchQueryEnd),    // Termina justo después
                limit(10)
            );
            const nameSnapshot = await getDocs(nameQuery);
            return nameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            */

            // --- INICIO: Filtro manual "contiene" (NO EFICIENTE - Solo usar si no puedes indexar o usar 'nameLowercase') ---
            console.warn("Realizando filtro manual 'contiene' para productos. Considerar optimizar con campo 'nameLowercase' e índices en Firestore si hay muchos productos.");
            const allProductsQuery = query(productsColRef, where("isActive", "==", true));
            const allDocsSnapshot = await getDocs(allProductsQuery);
            const productList = allDocsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(prod => prod.name && prod.name.toLowerCase().includes(searchQuery)) // Filtro manual
                .slice(0, 10); // Limitar resultados
            return productList;
            // --- FIN: Filtro manual "contiene" ---
        }
    } catch (error) {
        console.error("Error buscando productos: ", error);
        throw new Error("No se pudieron buscar los productos.");
    }
};

