  import React, { useState } from 'react';
  import { useCart } from '../../hooks/useCart'
  import { CatalogPanel } from '../../components/pos/CatalogPanel'
  import { CartPanel } from '../../components/pos/CartPanel'  
  import { TicketModal } from '../../components/modals/TicketModal'
  import { addPoints, saveSaleRecord } from '../../services/customerService'
  import { PaymentModal } from '../modals/PaymentModal';
  //import { processPaymentWithBanorte } from '../../services/banorteService'


  type PaymentMethod = 'efectivo' | 'terminal' | 'puntos';

  export default function POSScreen({ customer, onBack, showNotification }) {
    const [internalCustomer, setInternalCustomer] = useState(customer);
    const [isLoading, setIsLoading] = useState(false);
    const [saleReceipt, setSaleReceipt] = useState(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // <--- NUEVO ESTADO

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

    // (Esta función no cambia)
    const handleApplyPointsWithNotify = (points: number) => {
      try {
        applyPoints(points, internalCustomer.points);
        if (points === 0) {
          showNotification('Puntos reiniciados.', 'info');
        } else {
          showNotification(`${points} puntos aplicados correctamente.`, 'success');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    };

    // (Esta función no cambia)
    const handleCloseTicket = () => {
      setSaleReceipt(null);
      resetCart();
    };

    // (La lógica de pago no cambia, solo se llamará desde el modal)
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
        switch (paymentMethod) {
          case 'terminal':
            paymentSuccess = window.confirm(`Simular pago con Terminal por $${total.toFixed(2)}?`);
            if (!paymentSuccess) paymentError = 'Pago cancelado por el usuario.';
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
              totalForEarning = 0;
              finalTotalOnReceipt = 0.00; 
              finalDiscountOnReceipt = subtotal; 
            }
            break;
        }

        // --- PASO 2: Procesar la venta si el pago fue exitoso ---
        if (paymentSuccess) {
          console.log(`[handleProcessPayment] PASO 2: Pago (${paymentMethod}) EXITOSO.`);
          let pointsSummary = { before: 0, redeemed: 0, earned: 0, after: 0 };
          let updatedCustomerData = internalCustomer;

          if (internalCustomer) {
            const pointsEarned = Math.floor(totalForEarning / 10);
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
            } catch (pointsError) {
                console.error("ERROR EN ACTUALIZACIÓN DE PUNTOS:", pointsError);
                showNotification(`Error al actualizar puntos: ${pointsError.message}. La venta se guardará de todos modos.`, 'error');
            }
          } else {
            console.log("[handleProcessPayment] PASO 3 y 4 omitidos: No hay cliente.");
          }
          
          const receiptData = {
              folio: `SALE-${Date.now().toString().slice(-6)}`,
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
          } catch (saveError) {
              console.error("ERROR CRÍTICO AL GUARDAR VENTA:", saveError);
              showNotification(`Error Crítico: No se pudo guardar la venta - ${saveError.message}. REVISAR MANUALMENTE.`, 'error');
          }

        } else {
          showNotification(paymentError || 'Pago cancelado.', 'info');
          console.log("[handleProcessPayment] Pago cancelado o fallido.", paymentError);
        }
      } catch (error) { 
          console.error("ERROR INESPERADO EN handleProcessPayment:", error);
          showNotification(`Error en el proceso: ${error.message}`, 'error');
      } finally {
          setIsLoading(false); 
          console.log("[handleProcessPayment] PASO FINAL: Proceso terminado, isLoading: false.");
      }
    };
    

    // --- Renderizado ---
    return (
      <>
        {/* El modal del ticket (sólo se muestra DESPUÉS de un pago exitoso) */}
        {saleReceipt && <TicketModal receipt={saleReceipt} onClose={handleCloseTicket} />}

        {/* El NUEVO modal de pago (se muestra al hacer clic en "Proceder al Pago") */}
        {isPaymentModalOpen && (
          <PaymentModal
              total={total}
              customer={internalCustomer}
              isLoading={isLoading}
              onClose={() => setPaymentModalOpen(false)}
              onConfirm={(method) => {
                // 1. Cierra este modal
                setPaymentModalOpen(false);
                // 2. Inicia el proceso de pago
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
              onShowPaymentOptions={() => setPaymentModalOpen(true)} // <--- ASÍ SE CONECTA
              onBack={onBack}
              isLoading={isLoading}
            />

          </div>
        </div>
      </>
    );
  }