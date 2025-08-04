import React, { useState } from 'react';

interface RegisterScreenProps {
  onRegister: (name: string, phone: string) => Promise<boolean>;
  onBack: () => void;
}

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
    </svg>
);


export default function RegisterScreen({ onRegister, onBack }: RegisterScreenProps): React.ReactNode {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 10) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }
    setIsLoading(true);
    const success = await onRegister(name.trim(), phone.trim());
    if (!success) {
      // If registration failed, the component is still mounted. Reset loading state.
      setIsLoading(false);
    }
    // If successful, the component will unmount, so no need to manage state here.
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 ml-4">Registrar Nuevo Cliente</h2>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6">Complete los datos para crear una nueva cuenta en Carreto Plus.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
            placeholder="Ej. María López"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="phone-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de WhatsApp (10 dígitos)
          </label>
          <input
            id="phone-reg"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
            placeholder="Ej. 5512345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || name.length === 0 || phone.length < 10}
          className="w-full flex justify-center items-center gap-3 text-lg font-semibold py-4 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Registrando...' : 'Registrar Cliente'}
        </button>
      </form>
    </div>
  );
}
