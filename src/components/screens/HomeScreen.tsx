import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { Scanner } from '@yudiel/react-qr-scanner'; 

// Interfaz para los datos de sesión
interface SessionData {
  uid: string;
  email: string | null;
  role: string;
  stationId: string | null;
}

// Props que recibe HomeScreen
interface HomeScreenProps {
  onSearch: (phone: string) => void;
  onRegister: () => void;
  session: SessionData | null;
  onGoToLogin: () => void;
  onGoToAdmin: () => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// --- Iconos ---
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

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
// --- FIN Iconos ---

export default function HomeScreen({ 
  onSearch, 
  onRegister, 
  session, 
  onGoToLogin, 
  onGoToAdmin,
  showNotification
}: HomeScreenProps): React.ReactNode {
  
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [isScannerOpen, setIsScannerOpen] = useState(false); 

  // --- Lógica silenciosa de Check-in (POR VISITA SIN LÍMITE DIARIO) ---
  const processCheckIn = async (phoneToSearch: string): Promise<boolean> => {
    try {
      const q = query(collection(db, "customers"), where("phone", "==", phoneToSearch));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const customerDoc = snapshot.docs[0];
        const data = customerDoc.data();
        let currentCheckIns = data.checkIns || data.visits || 0;
        
        // Sumamos 1 incondicionalmente cada vez que se busca al cliente o se escanea su QR
        currentCheckIns += 1;
        
        await updateDoc(doc(db, "customers", customerDoc.id), {
          checkIns: currentCheckIns,
          visits: currentCheckIns, // Por compatibilidad
          lastCheckInDate: Timestamp.now()
        });
        
        return true; // Check-in exitoso siempre
      }
    } catch (e) {
      console.error("Error registrando check-in:", e);
    }
    return false; // Hubo un error o no se encontró el cliente
  };

  // --- Manejo del Escáner QR ---
  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0 && !isLoading) {
      const scannedText = detectedCodes[0].rawValue; 
      
      if (scannedText) {
        setIsScannerOpen(false); 
        setIsLoading(true);
        setError(null);
        
        try {
          let phoneToSearch = scannedText;
          if (scannedText.startsWith('CARRETO-')) {
            phoneToSearch = scannedText.replace('CARRETO-', '').trim();
          }

          setPhone(phoneToSearch); 
          
          // Procesamos Check-in de forma silenciosa
          const didCheckIn = await processCheckIn(phoneToSearch);
          
          if (didCheckIn && showNotification) {
             showNotification('✅ Check-in registrado (+1 visita)', 'success');
          }
          
          // Pasamos a caja de inmediato
          await onSearch(phoneToSearch);

        } catch (err) {
          console.error(err);
          setError("Error al procesar el código QR.");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    
    if (phone.trim().length < 10) {
      setError('Por favor, ingrese un número de teléfono válido de 10 dígitos.');
      return;
    }
    
    setIsLoading(true);
    
    // Procesamos Check-in de forma silenciosa
    const didCheckIn = await processCheckIn(phone.trim());
    
    if (didCheckIn && showNotification) {
        showNotification('✅ Check-in registrado (+1 visita)', 'success');
    }
    
    // Pasamos a caja de inmediato
    await onSearch(phone.trim());
    setIsLoading(false);
  };

  return (
    <>
      {/* --- MODAL DEL ESCÁNER DE CÁMARA --- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center touch-none">
          <button 
            onClick={() => setIsScannerOpen(false)}
            className="absolute right-6 z-50 text-white p-4 bg-gray-900/80 backdrop-blur-md rounded-full hover:bg-gray-800 active:scale-90 transition-all border border-gray-700"
            style={{ top: 'max(env(safe-area-inset-top), 2rem)' }} 
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-black relative flex flex-col justify-center">
            <div 
              className="absolute left-0 w-full text-center z-20 px-6"
              style={{ top: 'max(env(safe-area-inset-top), 6rem)' }} 
            >
              <h2 className="text-white text-2xl font-black uppercase tracking-widest drop-shadow-lg">
                Escanear Pase
              </h2>
            </div>
            <div className="w-full h-full flex items-center justify-center overflow-hidden bg-gray-900">
              <Scanner
                onScan={handleScan}
                onError={(error) => console.warn(error?.message)}
                formats={['qr_code']}
                components={{ audio: false, finder: true }}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- DISEÑO ORIGINAL RESTAURADO --- */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 text-center animate-fade-in relative z-10">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Bienvenido, Operador</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Ingrese el número de teléfono del cliente para comenzar.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          {/* GRUPO DE INPUT Y BOTÓN DE CÁMARA (FIX PARA MÓVIL) */}
          <div className="flex gap-2">
            <label htmlFor="phone" className="sr-only">Número de teléfono</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              /* min-w-0 permite que el input se reduzca sin empujar al botón */
              className={`min-w-0 flex-grow text-center text-xl sm:text-2xl p-4 bg-gray-100 dark:bg-gray-700 border-2 rounded-lg transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-emerald-500 focus:border-emerald-500'}`}
              placeholder="WhatsApp (10 dígitos)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              disabled={isLoading}
              /* shrink-0 aspect-square asegura que siempre sea cuadrado y nunca se apachurre */
              className="shrink-0 aspect-square bg-gray-900 text-white p-4 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Escanear QR"
            >
              <CameraIcon className="w-8 h-8" />
            </button>
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
            <button
              onClick={onGoToAdmin}
              className="w-full flex justify-center items-center gap-3 text-base font-medium py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75c-1.036 0-1.875-.84-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75C3.84 21.75 3 20.885 3 19.875v-6.75Z" />
              </svg>
              Ir al Panel de Administrador
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}