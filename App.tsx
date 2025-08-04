import React, { useState, useCallback, useEffect } from 'react';
import type { Customer, View, Notification } from './types';
import { findCustomerByPhone, registerCustomer as apiRegisterCustomer } from './services/customerService';

import Header from './components/Header';
import HomeScreen from './components/screens/HomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import CustomerScreen from './components/screens/CustomerScreen';
import NotificationBanner from './components/NotificationBanner';

export default function App(): React.ReactNode {
  const [view, setView] = useState<View>('home');
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  const handleSearch = useCallback(async (phone: string) => {
    try {
      const customer = await findCustomerByPhone(phone);
      if (customer) {
        setActiveCustomer(customer);
        setView('customer');
        showNotification(`Cliente ${customer.name} encontrado.`, 'success');
      } else {
        showNotification('Cliente no encontrado. Puede registrarlo.', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
      showNotification(errorMessage, 'error');
    }
  }, []);

  const handleStartRegistration = useCallback(() => {
    setView('register');
  }, []);
  
  const handleBackToHome = useCallback(() => {
    setView('home');
    setActiveCustomer(null);
  }, []);

  const handleRegister = useCallback(async (name: string, phone: string): Promise<boolean> => {
      try {
          const newCustomer = await apiRegisterCustomer(name, phone);
          setView('home');
          showNotification(`¡Cliente ${newCustomer.name} registrado con éxito!`, 'success');
          return true;
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al registrar';
          showNotification(errorMessage, 'error');
          return false;
      }
  }, []);
  
  const renderView = () => {
    switch (view) {
      case 'customer':
        return activeCustomer ? <CustomerScreen customer={activeCustomer} onBack={handleBackToHome} showNotification={showNotification} /> : <HomeScreen onSearch={handleSearch} onRegister={handleStartRegistration} />;
      case 'register':
        return <RegisterScreen onRegister={handleRegister} onBack={handleBackToHome} />;
      case 'home':
      default:
        return <HomeScreen onSearch={handleSearch} onRegister={handleStartRegistration} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <Header />
        <main className="mt-8">
          {notification && <NotificationBanner notification={notification} onDismiss={() => setNotification(null)} />}
          {renderView()}
        </main>
      </div>
    </div>
  );
}
