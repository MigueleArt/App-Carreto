
export interface Customer {
  id: string; // Unique, randomly generated customer identifier
  name: string;
  phone: string; // WhatsApp number, used for searching
  points: number;
}

export type View = 'home' | 'register' | 'customer';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}


export interface SessionData {
    uid: string;
    email: string | null;
    role: string;
    stationId: string | null;
}

export interface UserData {
    id?: string;
    email: string;
    role: string;
    stationId?: string;
}

export interface ProductData {
    id?: string;
    name: string;
    price: number;
    barcode?: string;
    department?: string;
    isActive: boolean;
}

export interface StationData {
    id?: string;
    name: string;
}