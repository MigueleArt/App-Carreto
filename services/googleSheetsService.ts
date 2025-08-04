
export interface TransactionData {
  customerId: string;
  phone: string;
  purchaseDate: string;
  purchaseAmount: number;
  pointsAccumulated: number;
}

// IMPORTANTE: Reemplaza esta URL con la URL de tu aplicación web de Google Apps Script.
const BACKEND_ENDPOINT = 'https://script.google.com/macros/s/AKfycby.../exec'; // <-- PEGA AQUÍ TU URL

/**
 * Logs a transaction to Google Sheets by sending data to a secure backend endpoint.
 * This endpoint is a Google Apps Script Web App that appends the data to the sheet.
 *
 * @param {TransactionData} data The transaction details to log.
 */
export const logTransactionToSheet = async (data: TransactionData): Promise<void> => {
  if (BACKEND_ENDPOINT.includes('AKfycby...')) {
      const warning = "ADVERTENCIA: La URL del backend de Google Sheets no ha sido configurada. La transacción no se registrará en la hoja de cálculo.";
      console.warn(warning);
      // No lanzamos un error para no interrumpir el flujo, pero notificamos en consola.
      return;
  }

  console.log('%c--- Sending transaction to Google Sheets Backend ---', 'color: #34A853; font-weight: bold;');
  
  try {
    const response = await fetch(BACKEND_ENDPOINT, {
      method: 'POST',
      // Google Apps Script requiere que el cuerpo sea un string, no un objeto JSON directo
      // y no se puede usar 'Content-Type': 'application/json'. Se envía como texto plano.
      body: JSON.stringify(data),
      mode: 'no-cors', // NOTA: Apps Script a menudo requiere 'no-cors' si no se configuran cabeceras CORS complejas.
                       // Esto significa que no podremos leer la respuesta, pero la solicitud se enviará.
                       // Para una app de producción, se configuraría CORS adecuadamente.
    });

    // Con no-cors, no podemos verificar el status de la respuesta. Confiamos en que se envió.
    console.log('%c--- Transaction data sent successfully! ---', 'color: #34A853;');
    
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    // En un entorno de QA, es mejor no lanzar un error que bloquee al usuario,
    // pero sí registrar que la auditoría falló.
    // throw new Error('No se pudo registrar la transacción en la hoja de cálculo.');
  }
};
