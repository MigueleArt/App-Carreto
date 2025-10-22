import React, { useState, useCallback, useEffect } from 'react';
// Asume que tus tipos y servicios están definidos
// import type { Customer, View, Notification } from './types';
import { findCustomerByPhone, registerCustomer as apiRegisterCustomer } from './services/customerService'; // Asegúrate que la ruta sea correcta
// Asume que tienes servicios para admin también
// import { getGasPrices, updateGasPrices, getProducts, addProduct, updateProduct } from './services/adminService'; // Asegúrate que la ruta sea correcta

import Header from './components/Header';
import HomeScreen from './components/screens/HomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import POSScreen from './components/screens/POSScreen'; // Pantalla principal del Punto de Venta
import AdminScreen from './components/screens/AdminScreen'; // Vista de Administración
import NotificationBanner from './components/NotificationBanner';

// Define tu número mágico aquí (Considera un método más seguro en producción)
const ADMIN_PHONE_NUMBER = '0000000000';

export default function App(): React.ReactNode {
  // Estados para controlar la vista actual y los datos del cliente/notificaciones
  const [view, setView] = useState('home'); // Vistas: 'home', 'register', 'pos', 'admin'
  const [activeCustomer, setActiveCustomer] = useState(null); // Cliente actualmente activo en el POS
  const [notification, setNotification] = useState(null); // Para mostrar mensajes al usuario

  // Efecto para limpiar notificaciones después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Manejador para buscar cliente o acceder al panel de admin
  const handleSearch = useCallback(async (phone) => {
    // --- LÓGICA DE ADMIN ---
    if (phone === ADMIN_PHONE_NUMBER) {
        setView('admin');
        showNotification('Acceso de Administrador concedido.', 'info');
        setActiveCustomer(null);
        return; // Detiene aquí si es admin
    }
    // --- FIN LÓGICA DE ADMIN ---

    // --- LÓGICA DE BÚSQUEDA DE CLIENTE ---
    try {
      // LLAMADA REAL AL SERVICIO (Asegúrate que `findCustomerByPhone` exista y funcione)
      const customer = await findCustomerByPhone(phone);

      if (customer) {
        setActiveCustomer(customer);
        setView('pos'); // Cambia a la vista del Punto de Venta
        showNotification(`Cliente ${customer.name} encontrado.`, 'success');
      } else {
        // Muestra error solo si no se encontró un cliente normal
        showNotification('Cliente no encontrado. Puede registrarlo.', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido al buscar';
      showNotification(errorMessage, 'error');
    }
  }, []); // Dependencias vacías si `findCustomerByPhone` no depende de props/estado externo

  // Navega a la pantalla de registro
  const handleStartRegistration = useCallback(() => {
    setView('register');
  }, []);
  
  // Regresa a la pantalla de inicio desde cualquier otra vista
  const handleBackToHome = useCallback(() => {
    setView('home');
    setActiveCustomer(null); // Limpia el cliente activo al volver a home
  }, []);

  // Manejador para registrar un nuevo cliente
  const handleRegister = useCallback(async (name, phone) => {
      try {
          // LLAMADA REAL AL SERVICIO (Asegúrate que `apiRegisterCustomer` exista y funcione)
          const newCustomer = await apiRegisterCustomer(name, phone);
          setView('home'); // Regresa a home después del registro exitoso
          showNotification(`¡Cliente ${newCustomer.name} registrado con éxito!`, 'success');
          return true; // Indica éxito
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al registrar';
          showNotification(errorMessage, 'error');
          return false; // Indica fallo
      }
  }, []); // Dependencias vacías si `apiRegisterCustomer` no depende de props/estado externo
  
  // Función que decide qué componente de pantalla renderizar
  const renderView = () => {
    switch (view) {
      case 'pos': // Vista del Punto de Venta
        // Asegúrate de que activeCustomer exista antes de renderizar POSScreen
        if (activeCustomer) {
          return <POSScreen customer={activeCustomer} onBack={handleBackToHome} showNotification={showNotification} />;
        }
        // Si por alguna razón view es 'pos' pero no hay cliente, regresa a 'home'
        setView('home'); // Corrección: Cambia la vista en lugar de retornar HomeScreen directamente aquí
        return <HomeScreen onSearch={handleSearch} onRegister={handleStartRegistration} />; // Muestra HomeScreen mientras cambia el estado
        
      case 'register':
        // CORRECCIÓN: Se eliminó showNotification de las props pasadas a RegisterScreen
        return <RegisterScreen onRegister={handleRegister} onBack={handleBackToHome} />; 
      case 'admin': // Vista de Administración
        return <AdminScreen onBack={handleBackToHome} showNotification={showNotification} />;
      case 'home':
      default: // Por defecto, muestra la pantalla de inicio
        return <HomeScreen onSearch={handleSearch} onRegister={handleStartRegistration} />;
    }
  };

  // Renderizado principal de la aplicación
  return (
    // Contenedor principal con estilos base
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Contenedor para centrar el contenido y limitar el ancho */}
      <div className="w-full max-w-2xl mx-auto"> 
        <Header /> {/* Componente de cabecera */}
        <main className="mt-8">
          {/* Muestra el banner de notificación si existe */}
          {notification && <NotificationBanner notification={notification} onDismiss={() => setNotification(null)} />}
          {/* Renderiza la vista activa */}
          {renderView()}
        </main>
      </div>
    </div>
  );
}

