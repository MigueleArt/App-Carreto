import { db } from '../firebaseConfig';
import { 
    doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, 
    query, where, orderBy, Timestamp, limit 
} from "firebase/firestore";

// --- Interfaces (Deberían estar en ../types) ---
export interface GasPrices {
    magnaPrice: number;
    premiumPrice: number;
    dieselPrice: number;
}

export interface UserData {
    id?: string;
    email: string;
    role: string;
    stationId?: string;
}

export interface StationData {
    id?: string;
    name: string;
}

export interface ProductData {
    id?: string;
    name: string;
    price: number;
    barcode?: string;
    department?: string;
    isActive: boolean;
}

// --- Constantes de Roles ---
const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    COORDINADOR: 'Coordinador',
    DESPACHADOR: 'Despachador'
};

const GAS_PRICES_DOC_ID = "settings";

// ==========================================
// 1. GESTIÓN DE PRECIOS DE GASOLINA
// ==========================================

export const getGasPrices = async (): Promise<GasPrices | null> => {
    const pricesDocRef = doc(db, "gasPrices", GAS_PRICES_DOC_ID);
    try {
        const docSnap = await getDoc(pricesDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                magnaPrice: Number(data.magnaPrice) || 0,
                premiumPrice: Number(data.premiumPrice) || 0,
                dieselPrice: Number(data.dieselPrice) || 0,
            };
        }
        return { magnaPrice: 0, premiumPrice: 0, dieselPrice: 0 };
    } catch (error) {
        console.error("Error obteniendo precios:", error);
        throw new Error("Error al obtener precios de gasolina.");
    }
};

export const updateGasPrices = async (prices: GasPrices): Promise<void> => {
    const pricesDocRef = doc(db, "gasPrices", GAS_PRICES_DOC_ID);
    try {
        await setDoc(pricesDocRef, { ...prices, lastUpdated: new Date() }, { merge: true });
    } catch (error) {
        console.error("Error updateGasPrices:", error);
        throw new Error("No se pudieron actualizar los precios.");
    }
};

// ==========================================
// 2. GESTIÓN DE USUARIOS
// ==========================================

export const getUsers = async (): Promise<UserData[]> => {
    const usersColRef = collection(db, "users");
    try {
        const q = query(usersColRef, orderBy("email"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
    } catch (error) {
        console.error("Error getUsers (fallback sin orden):", error);
        try {
             const snapshot = await getDocs(usersColRef);
             return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
        } catch (e) { 
            throw new Error("Error al cargar usuarios."); 
        }
    }
};

export const addUser = async (userData: UserData): Promise<void> => {
    const usersColRef = collection(db, "users");
    try {
        // Guarda el email en minúsculas para asegurar la búsqueda por email en App.tsx
        const dataToSave = {
            ...userData,
            email: userData.email.toLowerCase(),
            createdAt: new Date()
        };
        await addDoc(usersColRef, dataToSave);
    } catch (error) {
        console.error("Error addUser:", error);
        throw new Error("Error al crear usuario.");
    }
};

export const updateUser = async (userId: string, userData: Partial<UserData>): Promise<void> => {
    try {
        const dataToUpdate = userData.email 
            ? { ...userData, email: userData.email.toLowerCase() }
            : userData;
            
        await updateDoc(doc(db, "users", userId), dataToUpdate);
    } catch (error) {
        console.error("Error updateUser:", error);
        throw new Error("Error al actualizar usuario.");
    }
};

// ==========================================
// 3. GESTIÓN DE ESTACIONES
// ==========================================

export const getStations = async (): Promise<StationData[]> => {
    const colRef = collection(db, "stations");
    try {
        const q = query(colRef, orderBy("name"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StationData));
    } catch (error) {
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StationData));
    }
};

export const addStation = async (stationData: StationData): Promise<void> => {
    try {
        await addDoc(collection(db, "stations"), stationData);
    } catch (error) {
        throw new Error("Error al agregar estación.");
    }
};

export const updateStation = async (stationId: string, stationData: Partial<StationData>): Promise<void> => {
    try {
        await updateDoc(doc(db, "stations", stationId), stationData);
    } catch (error) {
        throw new Error("Error al actualizar estación.");
    }
};

// ==========================================
// 4. FUNCIONES DEL DASHBOARD Y REPORTES
// ==========================================

export const getHistoricalTotals = async (session: any) => {
    const salesCol = collection(db, "sales");
    let constraints: any[] = [];

    if (session.role === ROLES.COORDINADOR && session.stationId) {
        constraints.push(where("stationId", "==", session.stationId));
    }

    const q = query(salesCol, ...constraints);

    try {
        const snapshot = await getDocs(q);
        let totalRevenue = 0;
        let totalPointsRedeemed = 0;
        let totalSalesCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalRevenue += Number(data.total) || 0;
            totalPointsRedeemed += Number(data.redeemedPoints) || 0;
            totalSalesCount++;
        });

        return { totalRevenue, totalPointsRedeemed, totalSalesCount };
    } catch (error) {
        console.error("Error al obtener totales históricos:", error);
        throw new Error("No se pudo obtener el resumen histórico. Revise la consola.");
    }
};

export const getDashboardSummary = async (session: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const salesCol = collection(db, "sales");
    let constraints: any[] = [where("date", ">=", Timestamp.fromDate(today))];

    if (session.role === ROLES.COORDINADOR && session.stationId) {
        constraints.push(where("stationId", "==", session.stationId));
    }

    const q = query(salesCol, ...constraints);

    try {
        const snapshot = await getDocs(q);
        let totalRevenue = 0;
        let totalPointsRedeemed = 0;
        let totalSalesCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalRevenue += Number(data.total) || 0;
            totalPointsRedeemed += Number(data.redeemedPoints) || 0;
            totalSalesCount++;
        });

        return { totalRevenue, totalPointsRedeemed, totalSalesCount };
    } catch (error) {
        console.error("Error dashboard:", error);
        throw new Error("Error al obtener el resumen diario. Verifique los índices de Firestore.");
    }
};

/**
 * Obtiene el historial de ventas con filtros de rango de fechas y estación/pago.
 * Se optimizó la lógica para OMITIR los filtros cuando el valor es una cadena vacía.
 */
export const getSalesHistory = async (filters: any, session: any) => {
    const salesCol = collection(db, "sales");
    
    // Si usas múltiples where, DEBES ORDENAR primero por la primera condición.
    // Usaremos order by date desc, por lo que los where deben ser los últimos constraints
    let constraints: any[] = [];
    const finalFilters = { ...filters };

    // 1. Aplicar filtro de seguridad RBAC para Coordinador
    if (session.role === ROLES.COORDINADOR && session.stationId) {
        finalFilters.stationId = session.stationId;
    }

    // 2. Filtros de Estación (Solo si hay un valor seleccionado)
    // El valor finalFilters.stationId nunca será '' si el usuario es Coordinador
    if (finalFilters.stationId && finalFilters.stationId !== '') {
        constraints.push(where("stationId", "==", finalFilters.stationId));
    }

    // 3. Filtro de Método de Pago (FIX: SOLO aplicar si no es cadena vacía)
    if (finalFilters.paymentMethod && finalFilters.paymentMethod !== '') {
        constraints.push(where("paymentMethod", "==", finalFilters.paymentMethod));
    }
    
    // 4. Filtros de Fecha (Siempre van antes de la ordenación si son where)
    if (finalFilters.startDate) {
        constraints.push(where("date", ">=", Timestamp.fromDate(finalFilters.startDate)));
    }
    if (finalFilters.endDate) {
        const end = new Date(finalFilters.endDate);
        end.setHours(23, 59, 59, 999); 
        constraints.push(where("date", "<=", Timestamp.fromDate(end)));
    }
    
    // 5. Ordenación (Siempre va al final)
    constraints.push(orderBy("date", "desc"));
    
    try {
        const q = query(salesCol, ...constraints, limit(1000)); 
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    } catch (error: any) {
        console.error("Error historial:", error);
        if (error.code === 'failed-precondition') {
             console.warn("Falta índice compuesto. Fallback a últimas 50 ventas...");
             const fallbackQ = query(salesCol, orderBy("date", "desc"), limit(50));
             const snap = await getDocs(fallbackQ);
             return snap.docs.map(d => ({id: d.id, ...d.data()}));
        }
        throw new Error("Error al cargar historial.");
    }
};

// ==========================================
// 5. GESTIÓN DE PRODUCTOS
// ==========================================

export const getProducts = async (): Promise<ProductData[]> => {
    const productsColRef = collection(db, "products");
    try {
        const q = query(productsColRef, orderBy("name")); 
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductData));
    } catch (error) {
        const snapshot = await getDocs(productsColRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductData));
    }
};

export const addProduct = async (productData: ProductData): Promise<ProductData> => {
    const productsColRef = collection(db, "products");
    try {
        const dataToSave = { 
            ...productData, 
            price: Number(productData.price) || 0, 
            isActive: productData.isActive !== undefined ? productData.isActive : true,
            createdAt: new Date() 
        };
        const docRef = await addDoc(productsColRef, dataToSave);
        return { id: docRef.id, ...dataToSave } as ProductData;
    } catch (error) { 
        throw new Error("Error al crear producto."); 
    }
};

export const updateProduct = async (productId: string, productData: Partial<ProductData>): Promise<void> => {
    const productDocRef = doc(db, "products", productId);
    try {
        if (productData.price !== undefined) {
            (productData as any).price = Number(productData.price) || 0;
        }
        await updateDoc(productDocRef, { ...productData, lastUpdated: new Date() });
    } catch (error) { 
        throw new Error("Error al actualizar producto."); 
    }
};