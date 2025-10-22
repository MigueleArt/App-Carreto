// IMPORTANTE: Asegúrate que la ruta a tu archivo firebaseConfig sea correcta
import { db } from '../firebaseConfig'; // Importa TU instancia de Firestore
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, query, where } from "firebase/firestore";

// --- Gestión de Precios de Gasolina ---

// ID del documento específico donde se guardan los precios en tu colección 'gasPrices'
// CAMBIADO: Ajustado al ID de tu documento en Firestore
const GAS_PRICES_DOC_ID = "settings"; 

/**
 * Obtiene los precios actuales de la gasolina desde Firestore.
 * @returns {Promise<object|null>} Objeto con magnaPrice, premiumPrice, dieselPrice o null si no existe.
 */
export const getGasPrices = async () => {
    // CAMBIADO: Apunta a tu colección y documento específicos
    const pricesDocRef = doc(db, "gasPrices", GAS_PRICES_DOC_ID); 
    try {
        const docSnap = await getDoc(pricesDocRef);
        if (docSnap.exists()) {
            // Asegura devolver un objeto con valores definidos, incluso si faltan en la BD
            const data = docSnap.data();
            return {
                magnaPrice: data.magnaPrice || 0,
                premiumPrice: data.premiumPrice || 0,
                dieselPrice: data.dieselPrice || 0, // Asegúrate que el nombre del campo sea 'dieselPrice' en Firestore
            };
        } else {
            console.error(`¡Error Crítico! No se encontró el documento de precios esperado en gasPrices/${GAS_PRICES_DOC_ID}`);
            // En este caso, como el documento específico no existe, no deberíamos crearlo automáticamente.
            // Es mejor lanzar un error o devolver null para indicar que la configuración falta.
            // Opcional: Podrías crearlo si lo deseas, pero asegúrate de que sea la lógica correcta.
            // await setDoc(pricesDocRef, { magnaPrice: 0, premiumPrice: 0, dieselPrice: 0, lastUpdated: new Date() });
            // return { magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 };
            return null; // Indica que no se encontraron precios
        }
    } catch (error) {
        console.error("Error obteniendo precios de gasolina: ", error);
        throw new Error("No se pudieron obtener los precios de la gasolina.");
    }
};

/**
 * Actualiza los precios de la gasolina en Firestore.
 * @param {object} prices - Objeto con magnaPrice, premiumPrice, dieselPrice.
 */
export const updateGasPrices = async (prices) => {
    // CAMBIADO: Apunta a tu colección y documento específicos
    const pricesDocRef = doc(db, "gasPrices", GAS_PRICES_DOC_ID); 
    try {
        // Valida que los precios sean números antes de guardar
        const validatedPrices = {
            magnaPrice: Number(prices.magnaPrice) || 0,
            premiumPrice: Number(prices.premiumPrice) || 0,
            dieselPrice: Number(prices.dieselPrice) || 0, // Asegúrate que el nombre del campo sea 'dieselPrice'
        };
        // Usa setDoc con merge para actualizar o crear si no existiera (aunque getGasPrices debería haberlo creado si faltaba)
        await setDoc(pricesDocRef, { ...validatedPrices, lastUpdated: new Date() }, { merge: true });
        console.log("Precios de gasolina actualizados con éxito.");
    } catch (error) {
        console.error("Error actualizando precios de gasolina: ", error);
        throw new Error("No se pudieron actualizar los precios de la gasolina.");
    }
};

// --- Gestión de Productos ---

/**
 * Obtiene todos los productos de la colección 'products'.
 * @returns {Promise<Array<object>>} Array de objetos de producto.
 */
export const getProducts = async () => {
    const productsColRef = collection(db, "products");
    try {
        // Podrías ordenar por nombre si lo deseas: const q = query(productsColRef, orderBy("name"));
        const querySnapshot = await getDocs(productsColRef);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return productList;
    } catch (error) {
        console.error("Error obteniendo productos: ", error);
        throw new Error("No se pudieron obtener los productos.");
    }
};

/**
 * Agrega un nuevo producto a Firestore.
 * @param {object} productData - Datos del producto (sin ID).
 * @returns {Promise<object>} El producto agregado con su ID asignado por Firestore.
 */
export const addProduct = async (productData) => {
    const productsColRef = collection(db, "products");
    try {
        const dataToSave = {
            ...productData,
            price: Number(productData.price) || 0, // Asegura que price sea número
            isActive: productData.isActive !== undefined ? productData.isActive : true,
            createdAt: new Date(), // Añade fecha de creación
         };
        const docRef = await addDoc(productsColRef, dataToSave);
        console.log("Producto agregado con ID: ", docRef.id);
        return { id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error("Error agregando producto: ", error);
        throw new Error("No se pudo agregar el producto.");
    }
};

/**
 * Actualiza un producto existente en Firestore.
 * @param {string} productId - ID del documento del producto a actualizar.
 * @param {object} productData - Campos del producto a actualizar.
 */
export const updateProduct = async (productId, productData) => {
    const productDocRef = doc(db, "products", productId);
    try {
        // Asegura que price sea número si se está actualizando
        if (productData.price !== undefined) {
            productData.price = Number(productData.price) || 0;
        }
        await updateDoc(productDocRef, { ...productData, lastUpdated: new Date() }); // Añade fecha de actualización
        console.log("Producto actualizado con éxito: ", productId);
    } catch (error) {
        console.error("Error actualizando producto: ", error);
        throw new Error("No se pudo actualizar el producto.");
    }
};

// deleteProduct sigue igual (marca como inactivo)
/**
 * Marca un producto como inactivo (en lugar de borrarlo).
 * @param {string} productId - ID del producto a marcar como inactivo.
 */
export const deleteProduct = async (productId) => {
    await updateProduct(productId, { isActive: false });
    console.log("Producto marcado como inactivo: ", productId);
};

