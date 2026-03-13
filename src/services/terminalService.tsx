/**
 * terminalService.tsx
 * Comunicación con PAX A920 Pro (Banorte)
 *
 * MVP: Configuración hardcodeada.
 * TODO: Para despliegue final, mover estos valores a Firestore o .env
 * y cargar dinámicamente por gasolinera.
 */

// --- Configuración de la Terminal ---
// En producción, estos valores vendrán de Firestore o un .env local.
const TERMINAL_CONFIG = {
    ip: "192.168.100.135",
    port: "1818",
    timeout: 65000, // 65 segundos: tiempo suficiente para que el cliente pase la tarjeta
};

const MERCHANT_CONFIG = {
    affiliation: "7884666",
    user: "USUARIO",
    password: "PASSWORD",
    mode: "AUT",
};

// --- Tipos ---
export interface TerminalResponse {
    success: boolean;
    message: string;
    authCode: string;
    reference: string;
    /** true cuando la terminal respondió con HTTP no estándar pero el comando sí se envió */
    isBlindSuccess?: boolean;
}

// --- Comunicación con la Terminal ---

/**
 * Envía un comando a la terminal PAX via HTTP POST.
 * Maneja respuestas no estándar (ERR_INVALID_HTTP_RESPONSE) con un
 * "blind success" — asumiendo que el comando se envió correctamente
 * pero el protocolo de respuesta no es parseable por el browser.
 *
 * En el entorno final (Electron + proxy Node), el proxy se encargará
 * de normalizar las respuestas y este fallback no será necesario.
 */
async function sendCommand(payload: any): Promise<TerminalResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TERMINAL_CONFIG.timeout);

    // Registrar el momento de inicio para distinguir errores de conexión vs. protocolo
    const startTime = Date.now();

    try {
        const url = `http://${TERMINAL_CONFIG.ip}:${TERMINAL_CONFIG.port}/`;
        console.log(`[Terminal] Enviando comando: ${payload.CMD_TRANS}, Monto: $${payload.MONTO || 'N/A'}`);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const text = await response.text();
        clearTimeout(timeoutId);

        // Intentar extraer JSON de la respuesta
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

            const success = parsed.RESULTADO_PAYW === "A";
            console.log(`[Terminal] Respuesta: ${success ? "APROBADA" : "DENEGADA"} – ${parsed.TEXTO || ""}`);

            return {
                success,
                message: parsed.TEXTO || (success ? "Aprobada" : "Denegada por la terminal"),
                authCode: parsed.CODIGO_AUT || "N/A",
                reference: parsed.REFERENCIA || "N/A",
            };
        }

        // Respuesta sin JSON válido
        console.warn("[Terminal] Respuesta sin JSON válido:", text.substring(0, 200));
        return {
            success: false,
            message: "Respuesta de terminal no reconocida. Verifique el voucher físico.",
            authCode: "",
            reference: "",
        };
    } catch (error: any) {
        clearTimeout(timeoutId);
        const elapsedMs = Date.now() - startTime;

        // Timeout por AbortController (nuestro timeout de 65s)
        if (error.name === "AbortError") {
            console.warn("[Terminal] Timeout: no se completó en", TERMINAL_CONFIG.timeout / 1000, "segundos.");
            return {
                success: false,
                message: "Tiempo agotado. El cliente no completó el pago en la terminal.",
                authCode: "",
                reference: "",
            };
        }

        // Distinguir entre terminal inalcanzable vs. respuesta no estándar:
        //
        // - ERR_CONNECTION_TIMED_OUT / ERR_CONNECTION_REFUSED: la conexión TCP
        //   nunca se estableció → la terminal no está en la red. Estos errores
        //   tardan 10+ segundos (timeout de red del SO/browser).
        //
        // - ERR_INVALID_HTTP_RESPONSE: la conexión TCP SÍ se estableció y la
        //   terminal procesó el comando, pero respondió con protocolo no estándar.
        //   Esto ocurre rápido (< 10 segundos).
        //
        const CONNECTION_THRESHOLD_MS = 10000; // 10 segundos

        if (elapsedMs >= CONNECTION_THRESHOLD_MS) {
            // Tardó mucho → la terminal no responde / no está en la red
            console.error(`[Terminal] Terminal inalcanzable (${(elapsedMs / 1000).toFixed(1)}s):`, error.message);
            return {
                success: false,
                message: "No se pudo conectar con la terminal. Verifique que esté encendida y en la misma red o intente hacer el cobro manual.",
                authCode: "",
                reference: "",
            };
        }

        // Falló rápido → la conexión sí se hizo, pero la respuesta no es HTTP válido.
        // Esto es el escenario de "blind success" — el comando SÍ llegó a la terminal.
        console.warn(`[Terminal] Protocolo no estándar detectado (${elapsedMs}ms):`, error.message);
        console.warn("[Terminal] El comando fue enviado. Verificar voucher de la terminal.");

        return {
            success: true,
            message: "Pago enviado a la terminal. Verifique el voucher impreso.",
            authCode: "VER_TICKET",
            reference: "MANUAL",
            isBlindSuccess: true,
        };
    }
}

// --- API Pública ---

/**
 * Procesa un pago con tarjeta a través de la terminal Banorte.
 * @param amount - Monto a cobrar
 * @param folio - Número de control / folio de la venta
 */
export const processTerminalPayment = (
    amount: number,
    folio: string
): Promise<TerminalResponse> =>
    sendCommand({
        CMD_TRANS: "VENTA",
        ID_AFILIACION: MERCHANT_CONFIG.affiliation,
        USUARIO: MERCHANT_CONFIG.user,
        CLAVE_USR: MERCHANT_CONFIG.password,
        MODO: MERCHANT_CONFIG.mode,
        MONTO: amount.toFixed(2),
        NUMERO_CONTROL: folio,
        ID_TERMINAL: "A920PRO",
    });
