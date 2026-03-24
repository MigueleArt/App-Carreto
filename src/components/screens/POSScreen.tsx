import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { CatalogPanel } from '../../components/pos/CatalogPanel';
import { CartPanel } from '../../components/pos/CartPanel';
import { TicketModal } from '../../components/modals/TicketModal';
import { addPoints, saveSaleRecord } from '../../services/customerService';
import { PaymentModal } from '../modals/PaymentModal';
import { processTerminalPayment } from '../../services/terminalService';

type PaymentMethod = 'efectivo' | 'terminal' | 'puntos';

interface POSScreenProps {
  customer: any;
  onBack: () => void;
  showNotification: (msg: string, type: string) => void;
  session: { stationId: string | null } | null;
}

export default function POSScreen({ customer, onBack, showNotification, session }: POSScreenProps) {
  const [internalCustomer, setInternalCustomer] = useState(customer);
  const [isLoading, setIsLoading] = useState(false);
  const [saleReceipt, setSaleReceipt] = useState<any>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Estado para error de terminal con opciones de recuperación
  const [terminalError, setTerminalError] = useState<{
    show: boolean;
    message: string;
    folio: string;
  }>({ show: false, message: '', folio: '' });

  const {
    cart,
    subtotal,
    discount,
    total,
    redeemedPoints,
    addItem,
    removeItem,
    applyPoints,
    resetCart,
  } = useCart();

  // Función para aplicar puntos con notificación
  const handleApplyPointsWithNotify = (points: number) => {
    try {
      applyPoints(points, internalCustomer.points);
      if (points === 0) {
        showNotification('Puntos reiniciados.', 'info');
      } else {
        showNotification(`${points} puntos aplicados correctamente.`, 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'Error al aplicar puntos', 'error');
    }
  };

  // Cerrar el ticket y reiniciar carrito
  const handleCloseTicket = () => {
    setSaleReceipt(null);
    resetCart();
  };

  // Lógica principal de procesamiento de pago
  const handleProcessPayment = async (paymentMethod: PaymentMethod) => {
    if (total < 0 || cart.length === 0) {
      showNotification('Carrito vacío o total inválido.', 'error');
      return;
    }

    setIsLoading(true);
    console.log(`[handleProcessPayment] PASO 1: Iniciando pago con método: ${paymentMethod}.`);

    let paymentSuccess = false;
    let paymentError = '';

    let totalForEarning = total;
    let pointsToSpend = redeemedPoints;
    let finalTotalOnReceipt = total;
    let finalDiscountOnReceipt = discount;

    try {
      // --- Lógica de Simulación de Pago ---
      const saleFolio = `SALE-${Date.now().toString().slice(-6)}`;

      switch (paymentMethod) {
        case 'terminal':
          showNotification('🔄 Conectando con la terminal... Esperando respuesta.', 'info');
          const terminalResult = await processTerminalPayment(total, saleFolio, session?.stationId || '');
          if (terminalResult.success) {
            paymentSuccess = true;
            if (terminalResult.isBlindSuccess) {
              showNotification(
                '⚠️ Pago enviado a la terminal. Verifique el voucher impreso antes de continuar.',
                'warning'
              );
            } else {
              showNotification('✅ Pago con terminal aprobado.', 'success');
            }
          } else {
            // Mostrar modal de error con opciones de recuperación
            setTerminalError({
              show: true,
              message: terminalResult.message,
              folio: saleFolio,
            });
            setIsLoading(false);
            return; // Salir del flujo — el modal maneja las opciones
          }
          break;

        case 'efectivo':
          paymentSuccess = true;
          break;

        case 'puntos':
          const pointsNeededForPayment = total * 2;
          if (!internalCustomer) {
            paymentError = 'Se requiere un cliente para pagar con puntos.';
          } else if (internalCustomer.points < (pointsNeededForPayment + redeemedPoints)) {
            paymentError = `Puntos insuficientes. Se necesitan ${pointsNeededForPayment} y tienes ${internalCustomer.points}.`;
          } else {
            paymentSuccess = true;
            pointsToSpend += pointsNeededForPayment;
            totalForEarning = 0; // No se ganan puntos si se paga con puntos
            finalTotalOnReceipt = 0.00;
            finalDiscountOnReceipt = subtotal; // Todo fue descuento
          }
          break;
      }

      // --- PASO 2: Procesar la venta si el pago fue exitoso ---
      if (paymentSuccess) {
        console.log(`[handleProcessPayment] PASO 2: Pago (${paymentMethod}) EXITOSO.`);
        let pointsSummary = { before: 0, redeemed: 0, earned: 0, after: 0 };
        let updatedCustomerData = internalCustomer;

        if (internalCustomer) {
          const pointsEarned = Math.floor(totalForEarning / 100);
          const currentPoints = internalCustomer.points;
          const newPoints = currentPoints - pointsToSpend + pointsEarned;

          pointsSummary = {
            before: currentPoints,
            redeemed: pointsToSpend,
            earned: pointsEarned,
            after: newPoints
          };

          try {
            console.log("[handleProcessPayment] PASO 3: Intentando actualizar puntos en Firebase...");
            const result = await addPoints(internalCustomer.phone, totalForEarning, pointsToSpend);
            updatedCustomerData = result.customer;
            setInternalCustomer(updatedCustomerData);
            console.log("[handleProcessPayment] PASO 4: Puntos actualizados en Firebase y UI.");
          } catch (pointsError: any) {
            console.error("ERROR EN ACTUALIZACIÓN DE PUNTOS:", pointsError);
            showNotification(`Error al actualizar puntos: ${pointsError.message}. La venta se guardará de todos modos.`, 'error');
          }
        } else {
          console.log("[handleProcessPayment] PASO 3 y 4 omitidos: No hay cliente.");
        }

        const receiptData = {
          folio: saleFolio,
          date: new Date(),
          customerName: internalCustomer ? internalCustomer.name : 'Público General',
          customerId: internalCustomer ? internalCustomer.id : null,
          cart: [...cart],
          subtotal,
          discount: finalDiscountOnReceipt,
          redeemedPoints: pointsToSpend,
          total: finalTotalOnReceipt,
          paymentMethod: paymentMethod,
          points: pointsSummary,
        };
        console.log("[handleProcessPayment] PASO 5: Objeto del ticket construido:", receiptData);

        try {
          console.log("[handleProcessPayment] PASO 6: Intentando guardar venta en Firestore...");
          const saleId = await saveSaleRecord(receiptData);
          console.log("[handleProcessPayment] PASO 7: Venta guardada con ID:", saleId);
          showNotification(`Venta ${saleId.slice(-6)} registrada con éxito.`, 'success');
          setSaleReceipt(receiptData); // Muestra el modal del ticket
        } catch (saveError: any) {
          console.error("ERROR CRÍTICO AL GUARDAR VENTA:", saveError);
          showNotification(`Error Crítico: No se pudo guardar la venta - ${saveError.message}. REVISAR MANUALMENTE.`, 'error');
        }

      } else {
        showNotification(paymentError || 'Pago cancelado.', 'info');
        console.log("[handleProcessPayment] Pago cancelado o fallido.", paymentError);
      }
    } catch (error: any) {
      console.error("ERROR INESPERADO EN handleProcessPayment:", error);
      showNotification(`Error en el proceso: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      console.log("[handleProcessPayment] PASO FINAL: Proceso terminado, isLoading: false.");
    }
  };

  // Reintentar pago con terminal
  const handleRetryTerminal = () => {
    setTerminalError({ show: false, message: '', folio: '' });
    handleProcessPayment('terminal');
  };

  // Cambiar a cobro manual (efectivo) tras fallo de terminal
  const handleManualPayment = () => {
    setTerminalError({ show: false, message: '', folio: '' });
    handleProcessPayment('efectivo');
  };

  // Cancelar tras fallo de terminal
  const handleCancelTerminalError = () => {
    setTerminalError({ show: false, message: '', folio: '' });
    showNotification('Cobro cancelado.', 'info');
  };

  // --- Renderizado ---
  return (
    <>
      {/* El modal del ticket (sólo se muestra DESPUÉS de un pago exitoso) */}
      {saleReceipt && <TicketModal receipt={saleReceipt} onClose={handleCloseTicket} />}

      {/* Modal de error de terminal con opciones de recuperación */}
      {terminalError.show && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" style={{ animation: 'fadeIn 0.2s ease-out forwards' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header con ícono de error */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-800/30">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Error de Terminal</h2>
              <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-2">{terminalError.message}</p>
            </div>

            {/* Opciones */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">¿Qué desea hacer?</p>

              {/* Reintentar */}
              <button
                onClick={handleRetryTerminal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reintentar con Terminal
              </button>

              {/* Cobro manual */}
              <button
                onClick={handleManualPayment}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Cobrar en Efectivo
              </button>

              {/* Cancelar */}
              <button
                onClick={handleCancelTerminalError}
                className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
              >
                Cancelar transacción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* El modal de pago (se muestra al hacer clic en "Proceder al Pago") */}
      {isPaymentModalOpen && (
        <PaymentModal
          total={total}
          subtotal={subtotal}
          discount={discount}
          cart={cart}
          customer={internalCustomer}
          isLoading={isLoading}
          onClose={() => setPaymentModalOpen(false)}
          onConfirm={(method) => {
            setPaymentModalOpen(false);
            handleProcessPayment(method);
          }}
        />
      )}

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans justify-center">
        <div className="flex flex-col lg:flex-row w-full max-w-screen-2xl">

          <CatalogPanel
            onAddGas={addItem}
            onAddProduct={addItem}
            showNotification={showNotification}
          />

          <CartPanel
            customer={internalCustomer}
            cart={cart}
            subtotal={subtotal}
            discount={discount}
            total={total}
            redeemedPoints={redeemedPoints}
            onRemoveItem={removeItem}
            onApplyPoints={handleApplyPointsWithNotify}
            onShowPaymentOptions={() => setPaymentModalOpen(true)}
            onBack={onBack}
            isLoading={isLoading}
          />

        </div>
      </div>
    </>
  );
}