
import { GoogleGenAI } from "@google/genai";
import type { Customer } from '../types';

// Reads the API key from Vite's environment variables.
// The .env file should contain: VITE_GEMINI_API_KEY="your_key_here"
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not found. AI features will be disabled. Create a .env file in the root directory.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getSalesSuggestion = async (customer: Customer, purchaseAmount: number): Promise<string> => {
  if (!API_KEY) {
    return "Función de IA deshabilitada. Configure la VITE_GEMINI_API_KEY en un archivo .env.";
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
    "¡Con esta carga acumuló más puntos! Vuelva pronto!"
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
