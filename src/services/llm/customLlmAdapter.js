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
      const allModels = data?.data?.map(m => m.id) || [];
      // Filter out nirnay-ai from user visibility so users only see official TaxShield / standard tags
      const cleanModels = allModels.filter(m => !m.toLowerCase().includes("nirnay"));
      return {
        online: true,
        endpoint: cleanEndpoint,
        models: cleanModels,
        _rawModels: allModels
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
    "taxshield-ai";

  // Check health & fail fast if Ollama endpoint is offline
  try {
    const health = await checkCustomLlmHealth(endpoint);
    if (!health.online) {
      throw new Error(`TaxShield AI local endpoint (${endpoint}) is offline.`);
    }
    const availableModels = health._rawModels || health.models || [];
    if (Array.isArray(availableModels) && availableModels.length > 0) {
      if (!availableModels.includes(modelName)) {
        // Prefer specialized TaxShield AI models
        const preferred = ['taxshield-ai', 'taxshield-1b', 'qwen2.5:3b', 'llama3:8b', availableModels[0]];
        const match = preferred.find(p => availableModels.includes(p)) || availableModels[0];
        if (match) modelName = match;
      }
    }
  } catch (healthErr) {
    throw new Error(`Local TaxShield AI unavailable at ${endpoint}: ${healthErr.message}`);
  }

  // 1. Probe dedicated backend analysis endpoint first (handles mobile and web clients)
  try {
    const backendUrl = (typeof window !== 'undefined' && window.location?.origin)
      ? `${window.location.origin}/api/bills/analyze`
      : 'http://localhost:5000/api/bills/analyze';

    const backendController = new AbortController();
    const backendTimeout = setTimeout(() => backendController.abort(), 20000);

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: backendController.signal,
      body: JSON.stringify({ billText, options }),
    }).catch(() => null);

    clearTimeout(backendTimeout);

    if (backendRes && backendRes.ok) {
      const backendJson = await backendRes.json();
      if (backendJson?.success && backendJson?.data) {
        return {
          rawText: JSON.stringify(backendJson.data),
          provider: "custom",
          model: modelName,
          endpoint: backendUrl,
          backendEnriched: true,
        };
      }
    }
  } catch {
    // Proceed to direct Ollama endpoint
  }

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
