import { BILL_ANALYSIS_SYSTEM_PROMPT, buildBillAnalysisPrompt } from "./prompts.js";

async function prepareClaudeContent(billInput) {
  if (!billInput) return [{ type: "text", text: buildBillAnalysisPrompt("") }];

  if (typeof billInput !== "string") {
    if (billInput instanceof Blob || billInput instanceof File) {
      const buffer = await billInput.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: billInput.type || "image/jpeg",
            data: btoa(binary)
          }
        },
        {
          type: "text",
          text: "Extract all structured line items, taxes, fees, and totals from this bill receipt image per the system instructions:"
        }
      ];
    }
  }

  const trimmed = String(billInput).trim();

  // Data URL
  if (trimmed.startsWith("data:image/")) {
    const matches = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      return [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: matches[1],
            data: matches[2]
          }
        },
        {
          type: "text",
          text: "Extract all structured line items, taxes, fees, and totals from this bill receipt image per the system instructions:"
        }
      ];
    }
  }

  // HTTP or Blob image URL
  if (trimmed.startsWith("blob:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const resp = await fetch(trimmed);
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("image") || trimmed.startsWith("blob:") || /\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(trimmed)) {
        const blob = await resp.blob();
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: blob.type || "image/jpeg",
              data: btoa(binary)
            }
          },
          {
            type: "text",
            text: "Extract all structured line items, taxes, fees, and totals from this bill receipt image per the system instructions:"
          }
        ];
      }
    } catch (err) {
      console.warn("Claude Vision fetch failed, falling back to text prompt:", err.message);
    }
  }

  return [{ type: "text", text: buildBillAnalysisPrompt(trimmed) }];
}

export async function analyzeWithClaude(billText, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) || (typeof process !== 'undefined' && process.env?.VITE_ANTHROPIC_API_KEY);
  const modelName = options.model || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLAUDE_MODEL) || (typeof process !== 'undefined' && process.env?.VITE_CLAUDE_MODEL) || "claude-3-5-sonnet-20241022";

  if (!apiKey || apiKey.includes("your_anthropic_api_key")) {
    throw new Error("Anthropic Claude API Key is missing or default. Set VITE_ANTHROPIC_API_KEY in .env");
  }

  const contentBlocks = await prepareClaudeContent(billText);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 4096,
      temperature: 0.0,
      system: BILL_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: contentBlocks
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Claude API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "";

  return {
    rawText,
    provider: "claude",
    model: modelName
  };
}
