import { BILL_ANALYSIS_SYSTEM_PROMPT, buildBillAnalysisPrompt } from "./prompts.js";

/**
 * NVIDIA Nemotron Adapter for TaxShield AI
 * Uses NVIDIA API (https://integrate.api.nvidia.com/v1)
 *
 * FIX: Corrected model name from nonexistent "nvidia/nemotron-3-ultra-550b-a55b"
 * to the correct "nvidia/llama-3.1-nemotron-70b-instruct" available on the NVIDIA API.
 */
export async function analyzeWithNemotron(billText, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NVIDIA_API_KEY) || (typeof process !== 'undefined' && process.env?.VITE_NVIDIA_API_KEY);
  const modelName = options.model || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEMOTRON_MODEL) || (typeof process !== 'undefined' && process.env?.VITE_NEMOTRON_MODEL) || "nvidia/llama-3.1-nemotron-70b-instruct";
  const endpoint = options.endpoint || "https://integrate.api.nvidia.com/v1/chat/completions";

  if (!apiKey || apiKey.includes("your_nvidia_api_key")) {
    throw new Error("NVIDIA API Key is missing or default. Set VITE_NVIDIA_API_KEY in .env");
  }

  const prompt = buildBillAnalysisPrompt(billText);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Nemotron reasoning

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        temperature: 0.0,
        top_p: 0.95,
        max_tokens: 4096,
        messages: [
          { role: "system", content: BILL_ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `NVIDIA Nemotron API request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || data.choices?.[0]?.delta?.content || "";

    return {
      rawText,
      provider: "nemotron",
      model: modelName
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("NVIDIA Nemotron API request timed out after 60 seconds.");
    }
    throw err;
  }
}
