import React, { useState } from 'react';

// Icono para el botón de login (de Heroicons)
const LoginIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9a.75.75 0 0 1-1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

interface LoginScreenProps {
  // Esta función debe manejar la lógica de Firebase Auth
  // y lanzar un error si el login falla.
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps): React.ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingrese correo y contraseña.');
      return;
    }
    
    setIsLoading(true);
    setError(null); // Limpiar errores previos

    try {
      // Llamamos a la función que viene de props (que usará Firebase)
      await onLogin(email, password);
      // Si onLogin tiene éxito, el componente padre (App.tsx)
      // debe cambiar la vista al HomeScreen.
    } catch (authError: any) {
      // Capturamos el error de Firebase y mostramos un mensaje amigable
      let friendlyMessage = 'Error al iniciar sesión. Intente de nuevo.';
      
      // Códigos comunes de error de Firebase Auth
      if (authError.code) {
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            friendlyMessage = 'Correo o contraseña incorrectos.';
            break;
          case 'auth/invalid-email':
            friendlyMessage = 'El formato del correo no es válido.';
            break;
          case 'auth/too-many-requests':
            friendlyMessage = 'Demasiados intentos. Intente más tarde.';
            break;
        }
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 text-center animate-fade-in w-full max-w-md mx-auto">
      
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Acceso de Operador</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Ingrese sus credenciales para continuar.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        
        {/* Campo de Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
            placeholder="superadmin@carreto.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Campo de Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Botón de Submit */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full flex justify-center items-center gap-3 text-lg font-semibold py-4 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </>
          ) : (
            <>
              <LoginIcon className="w-6 h-6" />
              Iniciar Sesión
            </>
          )}
        </button>
      </form>
    </div>
  );
}