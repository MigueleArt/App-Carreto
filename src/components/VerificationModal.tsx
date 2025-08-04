
import React, { useState, useRef, useEffect } from 'react';

interface VerificationModalProps {
  phone: string;
  onConfirm: (code: string) => void;
  onCancel: () => void;
  expectedCodeForDemo?: string; // For displaying in the demo
}

export default function VerificationModal({ phone, onConfirm, onCancel, expectedCodeForDemo }: VerificationModalProps): React.ReactNode {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;
    setIsLoading(true);
    await onConfirm(code);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 transform transition-all">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Verificar Número</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
          Se envió un código de 4 dígitos al número <span className="font-semibold text-emerald-500">{phone}</span>.
        </p>

        {expectedCodeForDemo && (
             <p className="text-center text-xs text-blue-500 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-gray-700 rounded-md">
                (DEMO: El código es <span className="font-bold">{expectedCodeForDemo}</span>)
             </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="verification-code" className="sr-only">Código de Verificación</label>
            <input
              ref={inputRef}
              id="verification-code"
              name="code"
              type="tel"
              autoComplete="one-time-code"
              required
              className="w-full text-center tracking-[1em] text-3xl sm:text-4xl font-mono p-4 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:ring-emerald-500 focus:border-emerald-500 rounded-lg transition"
              placeholder="----"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || code.length < 4}
            className="w-full flex justify-center items-center gap-3 text-lg font-semibold py-4 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? 'Verificando...' : 'Confirmar Código'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onCancel} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
