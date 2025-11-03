import React, { useState, useCallback, useEffect } from 'react';

// --- Importaciones de Firebase ---
import { auth, db } from './firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";

// --- Servicios y Componentes ---
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
  const [view, setView] = useState('home'); // 'home' es ahora el default
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sessionUser, setSessionUser] = useState<SessionData | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'signedIn' | 'signedOut'>('loading');

  // Efecto para limpiar notificaciones
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Efecto de Auth MEJORADO ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthStatus('loading');
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const session: SessionData = {
            uid: user.uid,
            email: user.email,
            role: userData.role || 'Despachador',
            stationId: userData.stationId || null
          };
          setSessionUser(session);
          setAuthStatus('signedIn');

          // --- ¡CAMBIO REALIZADO! ---
          // Ya no redirige automáticamente. 
          // Siempre establece la vista en 'home' después de iniciar sesión.
          setView('home'); 

        } else {
          showNotification('Error: Usuario no registrado en la base de datos.', 'error');
          await signOut(auth);
          setSessionUser(null);
          setAuthStatus('signedOut');
          setView('home'); // Forzar vista a home
        }
      } else {
        setSessionUser(null);
        setAuthStatus('signedOut');
        setView('home'); // Forzar vista a home
      }
    });

    return () => unsubscribe();
  }, []); // Dependencia vacía, solo se ejecuta al montar

  // Función para mostrar notificaciones
  const showNotification = useCallback((message: string, type = 'info') => {
    setNotification({ message, type });
  }, []);

  // --- Funciones de Auth ---
  const handleLogin = useCallback(async (email: string, password: string) => {
    // La lógica de redirección ya no está aquí, está en onAuthStateChanged
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setView('home'); // Al salir, siempre a home
    setActiveCustomer(null);
  }, []);

  // --- Manejador de Búsqueda (SIMPLIFICADO) ---
  const handleSearch = useCallback(async (phone: string) => {
    // ¡Ya no hay lógica de admin aquí!
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
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar';
      showNotification(errorMessage, 'error');
    }
  }, [showNotification]); // Dependencia actualizada

  // --- Funciones de Navegación ---
  const handleStartRegistration = useCallback(() => {
    setView('register');
  }, []);
  
  const handleBackToHome = useCallback(() => {
    setView('home');
    setActiveCustomer(null);
  }, []);

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

  // --- Renderizado de Vistas (Actualizado) ---
  const renderView = () => {
    // Definimos la vista 'home' para reutilizarla
    const homeScreen = (
      <HomeScreen 
        onSearch={handleSearch} 
        onRegister={handleStartRegistration} 
        // Pasamos la sesión completa y los nuevos handlers
        session={sessionUser}
        onGoToLogin={() => setView('login')}
        onGoToAdmin={() => setView('admin')}
      />
    );

    switch (view) {
      case 'admin':
        // Proteger la ruta de admin
        const isAdmin = sessionUser?.role === 'Super Admin' || sessionUser?.role === 'Administrador' || sessionUser?.role === 'Coordinador';
        if (isAdmin) {
          return <AdminScreen onBack={handleBackToHome} showNotification={showNotification} />;
        }
        // Si no es admin (ej. un Despachador) pero intenta ir a 'admin', lo mandamos a 'home'
        setView('home');
        return homeScreen;

      case 'pos':
        if (activeCustomer) {
          return <POSScreen customer={activeCustomer} onBack={handleBackToHome} showNotification={showNotification} />;
        }
        setView('home'); // Si no hay cliente, a home
        return homeScreen;
      
      case 'register':
        return <RegisterScreen onRegister={handleRegister} onBack={handleBackToHome} />; 

      case 'home':
      default:
        return homeScreen;
    }
  };

  // --- Renderizado Principal (Actualizado) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto"> 
        
        {/* El Header ahora solo muestra email y botón de Logout (si está logueado) */}
        <Header userEmail={sessionUser?.email || null} onLogout={handleLogout} /> 
        
        <main className="mt-8">
          {notification && <NotificationBanner notification={notification} onDismiss={() => setNotification(null)} />}
          
          {authStatus === 'loading' ? (
            // --- 1. Cargando sesión ---
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando sesión...</p>
            </div>
          ) : view === 'login' ? (
            // --- 2. Vista de Login ---
            <LoginScreen onLogin={handleLogin} />
          ) : (
            // --- 3. Vistas principales (Home, Admin, POS, etc.) ---
            renderView()
          )}
        </main>
      </div>
    </div>
  );
}
