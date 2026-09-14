import { GoogleGenerativeAI } from "@google/generative-ai";
import { BILL_ANALYSIS_SYSTEM_PROMPT, buildBillAnalysisPrompt } from "./prompts.js";

/**
 * Converts image input (Base64 data URL, Blob URL, Cloudinary/HTTP URL, File/Blob)
 * into a Gemini multimodal inlineData object if applicable.
 */
export async function prepareGenerativeContentInput(billInput) {
  if (!billInput) return { promptText: "" };

  if (typeof billInput !== 'string') {
    if (billInput instanceof Blob || billInput instanceof File) {
      const arrayBuffer = await billInput.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      return {
        promptText: "Extract all structured line items, taxes, fees, and totals from this bill receipt image:",
        imagePart: {
          inlineData: {
            mimeType: billInput.type || 'image/jpeg',
            data: base64
          }
        }
      };
    }
    return { promptText: JSON.stringify(billInput) };
  }

  const trimmed = billInput.trim();

  // Data URL (data:image/png;base64,...)
  if (trimmed.startsWith('data:image/')) {
    const matches = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      return {
        promptText: "Extract all structured line items, taxes, fees, and totals from this bill receipt image:",
        imagePart: {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        }
      };
    }
  }

  // Blob URL or HTTP/HTTPS Image URL
  if (trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const resp = await fetch(trimmed);
      const contentType = resp.headers.get('content-type') || '';
      const isImage = contentType.includes('image') || trimmed.startsWith('blob:') || /\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(trimmed);

      if (isImage) {
        const blob = await resp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        return {
          promptText: "Extract all structured line items, taxes, fees, and totals from this receipt image:",
          imagePart: {
            inlineData: {
              mimeType: blob.type || 'image/jpeg',
              data: base64
            }
          }
        };
      }
    } catch (err) {
      console.warn("Gemini Vision adapter could not fetch image URL as blob:", err.message);
    }
  }

  return { promptText: trimmed };
}

export async function analyzeWithGemini(billInput, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY);
  const modelName = options.model || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || (typeof process !== 'undefined' && process.env?.VITE_GEMINI_MODEL) || "gemini-2.0-flash";

  if (!apiKey || apiKey.includes("your_gemini_api_key")) {
    throw new Error("Gemini API Key is missing or default. Set VITE_GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: BILL_ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.0,
      maxOutputTokens: 4096
    }
  });

  const { promptText, imagePart } = await prepareGenerativeContentInput(billInput);
  const prompt = buildBillAnalysisPrompt(promptText);

  let result;
  if (imagePart) {
    result = await model.generateContent([prompt, imagePart]);
  } else {
    result = await model.generateContent(prompt);
  }

  const responseText = result.response.text();

  return {
    rawText: responseText,
    provider: "gemini",
    model: modelName
  };
}
