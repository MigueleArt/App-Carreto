
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
