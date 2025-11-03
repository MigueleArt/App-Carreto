import React, { useState } from 'react';

// Interfaz para los datos de sesión (de App.tsx)
interface SessionData {
  uid: string;
  email: string | null;
  role: string;
  stationId: string | null;
}

// Props actualizadas que recibe HomeScreen
interface HomeScreenProps {
  onSearch: (phone: string) => void;
  onRegister: () => void;
  session: SessionData | null; // El usuario de sesión
  onGoToLogin: () => void;     // Función para ir a la vista de login
  onGoToAdmin: () => void;     // Función para ir a la vista de admin
}

// --- Iconos (tus existentes) ---
const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-2 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
        <path d="M12 1a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V2a1 1 0 0 1 1-1Z" />
        <path d="M2 19.387a8.5 8.5 0 0 1 14.59-6.284a1 1 0 0 1-1.058.21c-1.638-.64-3.444-.963-5.282-.963s-3.644.322-5.282.963a1 1 0 0 1-1.058-.21A8.502 8.502 0 0 1 2 19.387Z" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="m10.5 18c-4.142 0-7.5-3.358-7.5-7.5s3.358-7.5 7.5-7.5 7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5Zm8.146-1.146a1 1 0 0 0 0-1.414l-2.43-2.43a1 1 0 1 0-1.414 1.414l2.43 2.43a1 1 0 0 0 1.414 0Z" clipRule="evenodd" />
    </svg>
);
// --- FIN Iconos ---

// Recibimos las nuevas props
export default function HomeScreen({ 
  onSearch, 
  onRegister, 
  session, 
  onGoToLogin, 
  onGoToAdmin 
}: HomeScreenProps): React.ReactNode {
  
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado de error local

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpiar error previo
    
    if (phone.trim().length < 10) {
      // Reemplazamos el alert() con un estado de error local
      setError('Por favor, ingrese un número de teléfono válido de 10 dígitos.');
      return;
    }
    
    setIsLoading(true);
    await onSearch(phone.trim());
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 text-center animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Bienvenido, Operador</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Ingrese el número de teléfono del cliente para comenzar.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="phone" className="sr-only">Número de teléfono</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={`w-full text-center text-xl sm:text-2xl p-4 bg-gray-100 dark:bg-gray-700 border-2 rounded-lg transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-emerald-500 focus:border-emerald-500'}`}
            placeholder="Número de WhatsApp (10 dígitos)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            disabled={isLoading}
          />
        </div>
        
        {/* Mostrar el error local */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || phone.length < 10}
          className="w-full flex justify-center items-center gap-3 text-lg font-semibold py-4 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </>
          ) : (
            <>
              <SearchIcon className="w-6 h-6" />
              Buscar Cliente
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center">
        <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
        <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">O</span>
        <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">¿El cliente es nuevo?</p>

      <button
        onClick={onRegister}
        className="mt-2 w-full flex justify-center items-center gap-3 text-lg font-semibold py-4 px-4 border border-emerald-500 rounded-lg shadow-sm text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
      >
        <UserPlusIcon className="w-6 h-6"/>
        Registrar Nuevo Cliente
      </button>

      {/* --- INICIO: Bloque de Admin/Login --- */}
      <div className="mt-8">
        {!session ? (
          // 1. No hay sesión: Mostrar botón de Login
          <button
            onClick={onGoToLogin}
            className="w-full flex justify-center items-center gap-3 text-base font-medium py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M15.75 1.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.323l-3.003 3.003a.75.75 0 1 1-1.06-1.06l3.002-3.002h-2.322a.75.75 0 0 1 0-1.5h4.5Zm-2.625 9.12a.75.75 0 0 1 1.06 0l3.003 3.003v-2.323a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.323l-3.003-3.003a.75.75 0 0 1 0-1.06Zm-9 5.13a.75.75 0 0 1 1.06 0l3.003 3.002h-2.323a.75.75 0 0 1 0-1.5h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.323l-3.003 3.003a.75.75 0 1 1-1.06-1.06l3.003-3.003ZM8.625 1.5a.75.75 0 0 1 .75.75v2.323l3.003-3.003a.75.75 0 0 1 1.06 1.06L10.439 5.57v2.323a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .686-.743Z" clipRule="evenodd" />
            </svg>
            Login (Admin/Coordinador)
          </button>
        ) : (session.role === 'Super Admin' || session.role === 'Administrador' || session.role === 'Coordinador') ? (
          // 2. Sesión de Admin/Coord: Mostrar botón a Panel
          <button
            onClick={onGoToAdmin}
            className="w-full flex justify-center items-center gap-3 text-base font-medium py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75c-1.036 0-1.875-.84-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75C3.84 21.75 3 20.885 3 19.875v-6.75Z" />
            </svg>
            Ir al Panel de Administrador
          </button>
        ) : (
          // 3. Sesión de Despachador: No mostrar nada
          null
        )}
      </div>
      {/* --- FIN: Bloque de Admin/Login --- */}
      
    </div>
  );
}
