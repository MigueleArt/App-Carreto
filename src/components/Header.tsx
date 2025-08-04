
import React from 'react';

const GasPumpIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14 11h2v10h-2V11Zm-4 0H8v10H6V11H4V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5Zm-2-4v3h2V7H8Zm12-3h-2V2h-2v2h-2V2h-2v2h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 18h-8V6h8v16Z" />
    </svg>
);


export default function Header(): React.ReactNode {
  return (
    <header className="flex items-center justify-center text-center">
        <GasPumpIcon className="w-10 h-10 mr-4 text-emerald-500" />
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
                Carreto <span className="text-emerald-500">Plus</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Recompensas</p>
        </div>
    </header>
  );
}
