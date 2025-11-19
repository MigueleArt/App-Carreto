import React, { useState, useCallback, useEffect } from 'react';

// --- Importaciones de Firebase ---
import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection, query, where, getDocs
} from "firebase/firestore";

// --- Servicios y Componentes (Manteniendo las rutas originales) ---
import { findCustomerByPhone, registerCustomer as apiRegisterCustomer } from './services/customerService';
import Header from './components/Header';
import HomeScreen from './components/screens/HomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import POSScreen from './components/screens/POSScreen';
import AdminScreen from './components/screens/AdminScreen';
import NotificationBanner from './components/NotificationBanner';
import LoginScreen from './components/screens/LoginScreen';

// --- Interfaz de Sesión ---
interface SessionData {
  uid: string;
  email: string | null;
  role: string;
  stationId: string | null;
}

export default function App(): React.ReactNode {
  // --- Estados ---
  const [view, setView] = useState('home');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [notification, setNotification] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<SessionData | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'signedIn' | 'signedOut'>('loading');

  // Efecto para limpiar notificaciones
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Función para mostrar notificaciones
  const showNotification = useCallback((message: string, type = 'info') => {
    setNotification({ message, type });
  }, []);

  // --- Efecto de Auth Corregido (Busca por Email para IDs Aleatorios) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setAuthStatus('loading');

        try {
          const usersCol = collection(db, 'users');
          // IMPORTANTE: Consulta por email en minúsculas para compatibilidad.
          const q = query(usersCol, where('email', '==', user.email.toLowerCase()));

          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            const userData: any = userDoc.data();

            const session: SessionData = {
              uid: user.uid,
              email: user.email,
              role: userData.role || 'Despachador',
              stationId: userData.stationId || null
            };

            setSessionUser(session);
            setAuthStatus('signedIn');
            setView('home');
          } else {
            showNotification('Error: Usuario autenticado pero sin perfil de rol. Acceso denegado.', 'error');
            await signOut(auth);
            setSessionUser(null);
            setAuthStatus('signedOut');
            setView('home');
          }
        } catch (error) {
          console.error("Error al cargar perfil de usuario:", error);
          showNotification("Error de conexión/permisos al cargar el perfil de usuario.", "error");
          await signOut(auth);
          setSessionUser(null);
          setAuthStatus('signedOut');
          setView('home');
        }
      } else {
        setSessionUser(null);
        setAuthStatus('signedOut');
        setView('home');
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

  // --- Funciones de Auth y Navegación (sin cambios) ---
  const handleLogin = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setView('home');
    setActiveCustomer(null);
  }, []);

  const handleBackToHome = useCallback(() => {
    setView('home');
    setActiveCustomer(null);
  }, []);

  const handleStartRegistration = useCallback(() => {
    setView('register');
  }, []);

  const handleSearch = useCallback(async (phone: string) => {
    try {
      const customer = await findCustomerByPhone(phone);
      if (customer) {
        setActiveCustomer(customer);
        setView('pos');
        showNotification(`Cliente ${customer.name} encontrado.`, 'success');
      } else {
        showNotification('Cliente no encontrado. Puede registrarlo.', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al buscar cliente';
      showNotification(errorMessage, 'error');
    }
  }, [showNotification]);

  const handleRegister = useCallback(async (name: string, phone: string) => {
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
  }, [showNotification]);


  // --- Renderizado de Vistas (Aislamiento del Contenido) ---
  const renderViewContent = () => {
    const homeScreen = (
      <HomeScreen
        onSearch={handleSearch}
        onRegister={handleStartRegistration}
        session={sessionUser}
        onGoToLogin={() => setView('login')}
        onGoToAdmin={() => setView('admin')}
      />
    );

    switch (view) {
      case 'admin':
        const isAdmin = sessionUser?.role === 'Super Admin' || sessionUser?.role === 'Administrador' || sessionUser?.role === 'Coordinador';
        if (isAdmin && sessionUser) {
          // Retorna AdminScreen que es Fullscreen por diseño
          return <AdminScreen onBack={handleBackToHome} showNotification={showNotification} session={sessionUser} />;
        }
        setView('home');
        return homeScreen;

      case 'pos':
        if (activeCustomer) {
          return <POSScreen customer={activeCustomer} onBack={handleBackToHome} showNotification={showNotification} />;
        }
        setView('home');
        return homeScreen;

      case 'register':
        return <RegisterScreen onRegister={handleRegister} onBack={handleBackToHome} />;

      case 'home':
      default:
        return homeScreen;
    }
  };

  // --- Renderizado Principal (MODIFICADO PARA FULLSCREEN) ---

  const isFullScreenView = view === 'admin';

  return (
    // El contenedor principal usa clases condicionales para el padding y el ancho
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col ${isFullScreenView ? 'p-0 w-full' : 'p-4 sm:p-6 lg:p-8 items-center'}`}>

      {/* Contenedor interno: max-w-2xl para Home/Login, w-full para Admin */}
      <div className={`${isFullScreenView ? 'w-full' : 'w-full max-w-2xl mx-auto'}`}>

        {/* Ocultar Header si estamos en la vista de Admin */}
        {!isFullScreenView && <Header userEmail={sessionUser?.email || null} onLogout={handleLogout} />}

        <main className={isFullScreenView ? 'h-screen' : 'mt-8'}>
          {notification && <NotificationBanner notification={notification} onDismiss={() => setNotification(null)} />}

          {authStatus === 'loading' ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando sesión...</p>
            </div>
          ) : view === 'login' ? (
            <LoginScreen onLogin={handleLogin} />
          ) : (
            renderViewContent()
          )}
        </main>
      </div>
    </div>
  );
}