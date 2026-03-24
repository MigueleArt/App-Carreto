/**
 * terminalService.tsx
 * Comunicación con PAX A920 Pro (Banorte)
 *
 * La configuración de cada terminal se carga dinámicamente desde Firestore
 * (colección "terminalConfig"), donde cada documento tiene el ID de la estación.
 */

import { getTerminalConfigByStation, TerminalConfig } from './adminService';

// --- Tipos ---
export interface TerminalResponse {
    success: boolean;
    message: string;
    authCode: string;
    reference: string;
    /** true cuando la terminal respondió con HTTP no estándar pero el comando sí se envió */
    isBlindSuccess?: boolean;
}

// Timeout para la transacción (65 segundos: tiempo para que el cliente pase la tarjeta)
const TRANSACTION_TIMEOUT = 65000;

// --- Comunicación con la Terminal ---

/**
 * Envía un comando a la terminal PAX via HTTP POST.
 * Maneja respuestas no estándar (ERR_INVALID_HTTP_RESPONSE) con un
 * "blind success" — asumiendo que el comando se envió correctamente
 * pero el protocolo de respuesta no es parseable por el browser.
 *
 * En el APK nativo (Capacitor), CapacitorHttp intercepta el fetch()
 * automáticamente, eliminando las restricciones de CORS y mixed content.
 */
async function sendCommand(config: TerminalConfig, payload: any): Promise<TerminalResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSACTION_TIMEOUT);

    // Registrar el momento de inicio para distinguir errores de conexión vs. protocolo
    const startTime = Date.now();

    try {
        const url = `http://${config.ip}:${config.port}/`;
        console.log(`[Terminal] Enviando a ${config.ip}:${config.port} — Comando: ${payload.CMD_TRANS}, Monto: $${payload.MONTO || 'N/A'}`);

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
            console.warn("[Terminal] Timeout: no se completó en", TRANSACTION_TIMEOUT / 1000, "segundos.");
            return {
                success: false,
                message: "Tiempo agotado. El cliente no completó el pago en la terminal.",
                authCode: "",
                reference: "",
            };
        }

        // Distinguir entre terminal inalcanzable vs. respuesta no estándar
        const CONNECTION_THRESHOLD_MS = 10000; // 10 segundos

        if (elapsedMs >= CONNECTION_THRESHOLD_MS) {
            console.error(`[Terminal] Terminal inalcanzable (${(elapsedMs / 1000).toFixed(1)}s):`, error.message);
            return {
                success: false,
                message: "No se pudo conectar con la terminal. Verifique que esté encendida y en la misma red o intente hacer el cobro manual.",
                authCode: "",
                reference: "",
            };
        }

        // Falló rápido → la conexión sí se hizo, pero la respuesta no es HTTP válido.
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
 * Carga la configuración de la terminal desde Firestore según la estación.
 * 
 * @param amount - Monto a cobrar
 * @param folio - Número de control / folio de la venta
 * @param stationId - ID de la estación para cargar su configuración de terminal
 */
export const processTerminalPayment = async (
    amount: number,
    folio: string,
    stationId: string
): Promise<TerminalResponse> => {
    // 1. Cargar configuración de terminal desde Firestore
    const config = await getTerminalConfigByStation(stationId);

    if (!config) {
        return {
            success: false,
            message: "Esta estación no tiene una terminal configurada. Configure la terminal desde el panel de administración.",
            authCode: "",
            reference: "",
        };
    }

    if (!config.isActive) {
        return {
            success: false,
            message: "La terminal de esta estación está desactivada. Actívela desde el panel de administración.",
            authCode: "",
            reference: "",
        };
    }

    if (!config.ip || !config.ip.trim()) {
        return {
            success: false,
            message: "La terminal no tiene una dirección IP configurada. Configúrela desde el panel de administración.",
            authCode: "",
            reference: "",
        };
    }

    // 2. Enviar comando de venta
    return sendCommand(config, {
        CMD_TRANS: "VENTA",
        ID_AFILIACION: config.affiliation,
        USUARIO: config.user,
        CLAVE_USR: config.password,
        MODO: config.mode,
        MONTO: amount.toFixed(2),
        NUMERO_CONTROL: folio,
        ID_TERMINAL: "A920PRO",
    });
};

