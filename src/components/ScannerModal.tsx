
import React, { useState, useEffect, useRef } from 'react';

interface ScannerModalProps {
  onClose: () => void;
  onScanSuccess: (amount: number) => void;
  showNotification: (message: string, type: 'error' | 'info') => void;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function ScannerModal({ onClose, onScanSuccess, showNotification }: ScannerModalProps): React.ReactNode {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        const message = "No se pudo acceder a la cámara. Verifique los permisos en la configuración de su navegador.";
        setError(message);
        showNotification(message, 'error');
      }
    };
    
    startCamera();

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showNotification]);
  
  // Simulate scanning for a QR code or ticket data
  useEffect(() => {
      if (stream && !isScanning) {
          setIsScanning(true);
          const timer = setTimeout(() => {
              // In a real app, this would involve a library like a QR scanner.
              // Here, we simulate finding a ticket and extracting an amount.
              const randomAmount = Math.floor(Math.random() * (1500 - 150 + 1)) + 150;
              onScanSuccess(randomAmount);
          }, 3000); // Simulate 3 seconds of scanning

          return () => clearTimeout(timer);
      }
  }, [stream, onScanSuccess, isScanning]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">Escaneando Ticket</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                {stream && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
                {!stream && !error && (
                  <div className="text-white text-center">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando cámara...
                  </div>
                )}
                {error && <p className="text-red-400 p-4 text-center">{error}</p>}

                {/* Scanning overlay */}
                {stream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-3/4 max-w-xs h-1/2 border-4 border-dashed border-emerald-400 rounded-lg opacity-75" />
                        <p className="text-white text-lg font-semibold mt-4 bg-black/50 p-2 rounded">
                            {isScanning ? 'Detectando código...' : 'Apunta al ticket'}
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/30 rounded-full text-white hover:bg-black/60 transition-transform hover:scale-110"
                aria-label="Cerrar escáner"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
}
