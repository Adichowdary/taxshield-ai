import { BILL_ANALYSIS_SYSTEM_PROMPT, buildBillAnalysisPrompt } from "./prompts.js";

export async function checkCustomLlmHealth(endpoint) {
  const targetEndpoint = endpoint || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CUSTOM_LLM_ENDPOINT) || (typeof process !== 'undefined' && process.env?.VITE_CUSTOM_LLM_ENDPOINT) || "http://localhost:11434/v1";
  const cleanEndpoint = targetEndpoint.replace(/\/+$/, "");
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${cleanEndpoint}/models`, {
      method: "GET",
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data = await response.json().catch(() => null);
      return {
        online: true,
        endpoint: cleanEndpoint,
        models: data?.data?.map(m => m.id) || []
      };
    }

    return { online: false, endpoint: cleanEndpoint };
  } catch (error) {
    return { online: false, endpoint: cleanEndpoint, error: error.message };
  }
}

export async function analyzeWithCustomLlm(billText, options = {}) {
  const endpoint = (
    options.endpoint || 
    (typeof localStorage !== 'undefined' && localStorage.getItem('taxshield_custom_endpoint')) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CUSTOM_LLM_ENDPOINT) || 
    (typeof process !== 'undefined' && process.env?.VITE_CUSTOM_LLM_ENDPOINT) || 
    "http://localhost:11434/v1"
  ).replace(/\/+$/, "");

  let modelName = 
    options.model || 
    (typeof localStorage !== 'undefined' && localStorage.getItem('taxshield_custom_model')) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CUSTOM_LLM_MODEL) || 
    (typeof process !== 'undefined' && process.env?.VITE_CUSTOM_LLM_MODEL) || 
    "qwen2.5:3b";

  // Check health & fail fast if Ollama endpoint is offline
  try {
    const health = await checkCustomLlmHealth(endpoint);
    if (!health.online) {
      throw new Error(`TaxShield AI local endpoint (${endpoint}) is offline.`);
    }
    if (Array.isArray(health.models) && health.models.length > 0) {
      if (!health.models.includes(modelName)) {
        // Pick best available model in Ollama
        const preferred = ['qwen2.5:3b', 'llama3:8b', 'nirnay-ai:latest'];
        const match = preferred.find(p => health.models.includes(p)) || health.models[0];
        if (match) modelName = match;
      }
    }
  } catch (healthErr) {
    throw new Error(`Local TaxShield AI unavailable at ${endpoint}: ${healthErr.message}`);
  }

  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CUSTOM_LLM_API_KEY) || (typeof process !== 'undefined' && process.env?.VITE_CUSTOM_LLM_API_KEY) || "";

  const userPrompt = buildBillAnalysisPrompt(billText);
  const completionsUrl = `${endpoint}/chat/completions`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for local inference

  let response;
  try {
    response = await fetch(completionsUrl, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        temperature: 0.0,
        top_p: 0.9,
        seed: 42,
        max_tokens: 2048,
        // Enforce JSON object output format across Ollama and OpenAI-compatible endpoints
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: BILL_ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`TaxShield AI request timed out after 60s at ${endpoint}`);
    }
    throw new Error(`Cannot connect to TaxShield AI server at ${endpoint}. Please ensure Ollama is running ('ollama run ${modelName}').`);
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`TaxShield AI returned HTTP ${response.status}: ${errText.slice(0, 150)}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";

  return {
    rawText,
    provider: "custom",
    model: modelName,
    endpoint
  };
}
