import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, CropRecommendation } from "../types";

// Initialize Gemini Client
// We create a new instance to ensure we're using the freshest context if needed
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Helper to execute AI calls with retry logic for 429 and 5xx errors
 */
async function executeWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  let lastError: any;
  const ai = getAI();

  for (let i = 0; i < retries + 1; i++) {
    try {
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || "";
      const isRetryable = errorMessage.includes('429') || errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      if (isRetryable && i < retries) {
        console.warn(`Gemini API error (attempt ${i + 1}/${retries + 1}). Retrying in ${delay}ms...`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      break;
    }
  }

  // Final failure handling
  if (lastError?.message?.includes('429') || lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("QUOTA_EXCEEDED: You have exceeded the AI request limit. Please wait 60 seconds and try again.");
  }
  throw lastError;
}

export const getCropRecommendation = async (data: SoilData): Promise<CropRecommendation> => {
  const prompt = `
    Analyze the following soil and weather conditions for agricultural suitability:
    Nitrogen: ${data.nitrogen}, Phosphorus: ${data.phosphorus}, Potassium: ${data.potassium}
    Temp: ${data.temperature}°C, Humidity: ${data.humidity}%, pH: ${data.ph}, Rainfall: ${data.rainfall}mm
    Recommend the single best crop to grow. Provide reasoning, fertilizer advice, and estimated yield.
  `;

  try {
    const responseText = await executeWithRetry(async (ai) => {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crop: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              requiredFertilizer: { type: Type.STRING },
              estimatedYield: { type: Type.STRING },
            },
            required: ["crop", "confidence", "reasoning", "requiredFertilizer", "estimatedYield"],
          }
        }
      });
      return result.text;
    });

    if (!responseText) throw new Error("Empty response from AI");
    return JSON.parse(responseText) as CropRecommendation;
  } catch (error: any) {
    console.error("Gemini Recommendation Error:", error);
    throw error;
  }
};

export const getSoilAnalysis = async (location: string) => {
  const prompt = `
    You are an advanced Location-Based Agricultural Decision Support System.
    Integrate location data, soil analysis, crop recommendations, government schemes, and price prediction for: ${location}.
    
    OUTPUT FORMAT:
    **Location Identified:** ...
    **Soil Analysis:** ...
    **Crop Recommendations:** ...
    **Government Schemes Highlighted:** ...
    **Price Prediction & Market Analytics:** ...
    **Final Summary & Insights:** ...
  `;

  try {
    return await executeWithRetry(async (ai) => {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return result.text;
    });
  } catch (error: any) {
    console.error("Soil Analysis Error:", error);
    if (error.message.includes("QUOTA_EXCEEDED")) {
      return "**SERVICE ERROR:**\n\n### Quota Exceeded\nThe AI decision support engine has reached its request limit. Please wait approximately 1 minute for the quota to reset before generating a new report.";
    }
    return "Unable to analyze the location. Please ensure the location is correct and try again.";
  }
};

export const getMarketOutlook = async (commodity: string) => {
  const prompt = `Provide a concise 3-sentence market outlook for ${commodity}. Focus on supply-demand and price drivers.`;

  try {
    return await executeWithRetry(async (ai) => {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return result.text;
    });
  } catch (error: any) {
    console.error("Market Outlook Error:", error);
    if (error.message.includes("QUOTA_EXCEEDED")) {
      return "Market data temporarily throttled. Quota exceeded.";
    }
    return "Market analysis temporarily unavailable.";
  }
};

export const getAdvisoryResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    return await executeWithRetry(async (ai) => {
      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: "You are 'AgriBot', a master agricultural consultant. Provide clear headings, bullet points, and professional advice.",
        },
        history: history
      });
      const result = await chat.sendMessage({ message: newMessage });
      return result.text;
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    if (error.message.includes("QUOTA_EXCEEDED")) {
      return "### Service Notice\nMy advanced reasoning engine has reached its limit. Please wait a moment before sending another message.";
    }
    return "I am currently having trouble connecting. Please try again later.";
  }
};

export const analyzeGovData = async (alerts: any[], stats: any) => {
  const prompt = `Act as a policy analyst. Summary for Minister: Alerts: ${JSON.stringify(alerts)}, Stats: ${JSON.stringify(stats)}. 3 bullet points.`;

  try {
    return await executeWithRetry(async (ai) => {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return result.text;
    });
  } catch (error) {
    return "Analysis unavailable due to service quota.";
  }
};