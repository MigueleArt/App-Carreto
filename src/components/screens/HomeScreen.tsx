
import React, { useState } from 'react';

interface HomeScreenProps {
  onSearch: (phone: string) => void;
  onRegister: () => void;
}

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

export default function HomeScreen({ onSearch, onRegister }: HomeScreenProps): React.ReactNode {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 10) {
      // Basic validation, can be improved
      alert('Por favor, ingrese un número de teléfono válido de 10 dígitos.');
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
            className="w-full text-center text-xl sm:text-2xl p-4 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
            placeholder="Número de WhatsApp (10 dígitos)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            disabled={isLoading}
          />
        </div>

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
    </div>
  );
}
