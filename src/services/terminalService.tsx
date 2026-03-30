/**
 * terminalService.tsx
 * Comunicación con PAX A920 Pro (Banorte) — Protocolo Interredes
 *
 * La configuración de cada terminal se carga dinámicamente desde Firestore
 * (colección "terminalConfig"), donde cada documento tiene el ID de la estación.
 *
 * Referencia: Anexo III y IV de Banorte Payworks.
 */

import { getTerminalConfigByStation, TerminalConfig } from './adminService';

// --- Tipos ---
export interface TerminalResponse {
    success: boolean;
    message: string;
    authCode: string;
    reference: string;
    /** true cuando la terminal probablemente procesó pero la respuesta se cortó */
    isBlindSuccess?: boolean;
}

// Timeout para la transacción (65 segundos: tiempo para que el cliente pase la tarjeta)
const TRANSACTION_TIMEOUT = 65000;

// Umbral para determinar si la terminal alcanzó a procesar algo.
// Si el error tarda más de 20s, la terminal probablemente SÍ recibió el comando
// y el corte fue en la respuesta. Si falla en <5s, nunca llegó.
const BLIND_SUCCESS_THRESHOLD_MS = 20000;
const CONNECTION_FAILURE_THRESHOLD_MS = 5000;

// --- Comunicación con la Terminal ---

/**
 * Envía un comando a la terminal PAX via HTTP POST.
 *
 * En el APK nativo (Capacitor), CapacitorHttp intercepta el fetch()
 * automáticamente, eliminando las restricciones de CORS y mixed content.
 */
async function sendCommand(config: TerminalConfig, payload: any): Promise<TerminalResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSACTION_TIMEOUT);

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

        // Intentar extraer JSON de la respuesta (robusto ante cabeceras mal formadas de PAX)
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

        console.error(`[Terminal] Error de conexión (${elapsedMs}ms):`, error.message);

        // Fallo rápido (<5s): la terminal NUNCA recibió el comando
        if (elapsedMs < CONNECTION_FAILURE_THRESHOLD_MS) {
            return {
                success: false,
                message: `Error de comunicación con la terminal: ${error.message || 'conexión rechazada'}. Verifique la IP, el puerto y que la terminal esté en modo espera.`,
                authCode: "",
                reference: "",
            };
        }

        // Fallo lento (>20s): la terminal probablemente SÍ procesó pero la respuesta se cortó
        // Marcamos como blind success para que el despachador verifique el voucher físico
        if (elapsedMs >= BLIND_SUCCESS_THRESHOLD_MS) {
            console.warn(`[Terminal] Posible éxito ciego (${elapsedMs}ms). Verificar voucher físico.`);
            return {
                success: true,
                message: "Pago posiblemente procesado. VERIFIQUE el voucher impreso en la terminal antes de continuar.",
                authCode: "VER_TICKET",
                reference: "MANUAL",
                isBlindSuccess: true,
            };
        }

        // Rango intermedio (5-20s): no hay certeza. Marcamos como fallo para no cobrar doble.
        return {
            success: false,
            message: "No se pudo conectar con la terminal. Verifique que esté encendida y en la misma red.",
            authCode: "",
            reference: "",
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

    // 2. Enviar comando de venta (Anexo III)
    return sendCommand(config, {
        CMD_TRANS: "VENTA",
        ID_AFILIACION: config.affiliation,
        USUARIO: config.user,
        CLAVE_USR: config.password,
        MODO: config.mode,
        MONTO: amount.toFixed(2),
        NUMERO_CONTROL: folio,
        ID_TERMINAL: config.terminalId || "A920PRO",
    });
};

/**
 * Sincroniza las llaves de cifrado con el host del banco (Anexo III - OBTENER_LLAVE).
 * Según Banorte, es obligatorio ejecutar esto:
 * - Al menos una vez al día
 * - Cuando la terminal se reinicia
 * - Antes de la primera transacción del día
 *
 * @param stationId - ID de la estación
 */
export const obtenerLlaveTerminal = async (stationId: string): Promise<TerminalResponse> => {
    const config = await getTerminalConfigByStation(stationId);

    if (!config) {
        return {
            success: false,
            message: "Esta estación no tiene una terminal configurada.",
            authCode: "",
            reference: "",
        };
    }

    if (!config.ip || !config.ip.trim()) {
        return {
            success: false,
            message: "La terminal no tiene una dirección IP configurada.",
            authCode: "",
            reference: "",
        };
    }

    console.log(`[Terminal] Solicitando OBTENER_LLAVE para estación ${stationId}...`);

    return sendCommand(config, {
        CMD_TRANS: "OBTENER_LLAVE",
        ID_AFILIACION: config.affiliation,
        USUARIO: config.user,
        CLAVE_USR: config.password,
        ID_TERMINAL: config.terminalId || "A920PRO",
    });
};

