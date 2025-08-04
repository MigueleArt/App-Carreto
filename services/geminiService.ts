
import { GoogleGenAI } from "@google/genai";
import type { Customer } from '../types';

// IMPORTANT: This requires the API_KEY environment variable to be set.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getSalesSuggestion = async (customer: Customer, purchaseAmount: number): Promise<string> => {
  if (!API_KEY) {
    return "Función de IA deshabilitada. Configure la API_KEY.";
  }

  const model = 'gemini-2.5-flash';

  const prompt = `
    Eres un asistente para operadores de una estación de gasolina en México llamada "Carreto Plus".
    Un cliente llamado "${customer.name}" tiene ${customer.points} puntos de lealtad.
    Acaba de cargar $${purchaseAmount} de gasolina.
    Genera una sugerencia de venta o un comentario amigable y muy corto (máximo 20 palabras) para que el operador se lo diga al cliente.
    La sugerencia debe ser en español mexicano, sonar natural y no agresiva.
    Ejemplos de sugerencias: ofrecer un lavado de auto, un café, una promoción de aceite, o recordarle los beneficios de sus puntos.
    
    Ejemplo de formato de respuesta:
    "¡Con esta carga acumuló más puntos! ¿No le gustaría un café para el camino?"
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.8,
          topP: 1,
          topK: 32,
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error fetching sales suggestion from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Error: La clave de API no es válida. Verifique la configuración.";
    }
    return "No se pudo generar una sugerencia en este momento.";
  }
};
