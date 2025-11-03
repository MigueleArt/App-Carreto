import React from 'react';

// Props que App.tsx le pasa al Header
interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

// Icono de "Salir" (ArrowRightOnRectangle de Heroicons)
const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75Zm-3.75 3.75a.75.75 0 0 0 0 1.06l1.72 1.72H3a.75.75 0 0 0 0 1.5h10.97l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
  </svg>
);

// Icono de Gas (de tu versión anterior)
const GasPumpIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14 11h2v10h-2V11Zm-4 0H8v10H6V11H4V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5Zm-2-4v3h2V7H8Zm12-3h-2V2h-2v2h-2V2h-2v2h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 18h-8V6h8v16Z" />
    </svg>
);


export default function Header({ userEmail, onLogout }: HeaderProps): React.ReactNode {
  
  // --- Lógica condicional para el layout ---
  // Si userEmail existe (logueado), usa justify-between.
  // Si es null (deslogueado), usa justify-center (como tu header original).
  const headerClassName = `
    flex items-center w-full py-4 border-b border-gray-200 dark:border-gray-700
    ${userEmail ? 'justify-between' : 'justify-center text-center'}
  `;
  
  return (
    <header className={headerClassName}>
      
      {/* Título de la App (Siempre se muestra) */}
      <div className="flex items-center"> {/* Contenedor para ícono y texto */}
        <GasPumpIcon className="w-10 h-10 mr-4 text-emerald-500" />
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
                Carreto <span className="text-emerald-500">Plus</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Recompensas</p>
        </div>
      </div>

      {/* Contenedor para el email y botón de Salir (Lógica de v1) */}
      {/* Solo se muestra si el usuario ha iniciado sesión (userEmail no es null) */}
      {userEmail && (
        <div className="flex items-center gap-4">
          
          {/* Email del usuario (se oculta en pantallas pequeñas) */}
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {userEmail}
          </span>
          
          {/* Botón de Salir (Logout) */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="hidden md:block">Salir</span>
          </button>
        </div>
      )}
    </header>
  );
}