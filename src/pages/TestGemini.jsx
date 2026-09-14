import { useState } from "react";
import { analyzeBill } from "../services/llm/llmGateway";
import { checkCustomLlmHealth } from "../services/llm/customLlmAdapter";

export default function TestGemini() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProvider, _setSelectedProvider] = useState("custom");
  const [gpuStatus, setGpuStatus] = useState(null);

  const checkGpu = async () => {
    const health = await checkCustomLlmHealth();
    setGpuStatus(health);
  };

  const test = async (providerOverride) => {
    setLoading(true);
    setResponse("Analyzing bill with AI...");

    const providerToUse = providerOverride || selectedProvider;

    const sampleBill = `
Paradise Restaurant & Bar
GSTIN: 36AABCT3518Q1ZX
Date: 2026-08-08

1x Paneer Biryani - ₹320.00
2x Butter Naan - ₹80.00
1x Fresh Lime Soda - ₹60.00

Subtotal: ₹460.00
CGST (2.5%): ₹11.50
SGST (2.5%): ₹11.50
Service Charge (10%): ₹46.00

Total Payable: ₹529.00
Thank you for dining with us!
`;

    try {
      const result = await analyzeBill(sampleBill, { provider: providerToUse });
      console.log("LLM Gateway Result:", result);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("LLM Gateway Error:", error);
      setResponse(`ERROR (${providerToUse}): ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>TaxShield AI / LLM Multi-Provider Test Bench</h1>
      <p style={{ color: "#666" }}>Test and benchmark TaxShield AI (Local GPU), Google Gemini, and Anthropic Claude.</p>

      <div style={{ background: "#f5f5f5", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
        <h3>TaxShield AI Connection Test</h3>
        <button 
          onClick={checkGpu}
          style={{ padding: "8px 16px", background: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Check TaxShield AI (Ollama)
        </button>

        {gpuStatus && (
          <div style={{ marginTop: "10px", padding: "10px", background: gpuStatus.online ? "#e6fffa" : "#fff5f5", border: `1px solid ${gpuStatus.online ? "#319795" : "#e53e3e"}`, borderRadius: "6px" }}>
            <strong>Status:</strong> {gpuStatus.online ? "ONLINE 🟢" : "OFFLINE 🔴"}<br />
            <strong>Endpoint:</strong> {gpuStatus.endpoint}<br />
            {gpuStatus.models && <span><strong>Available Models:</strong> {gpuStatus.models.join(", ") || "None"}</span>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => test("custom")}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Test TaxShield AI
        </button>

        <button
          onClick={() => test("gemini")}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Test Google Gemini
        </button>

        <button
          onClick={() => test("nemotron")}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#65a30d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Test NVIDIA Nemotron 3
        </button>

        <button
          onClick={() => test("claude")}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Test Anthropic Claude
        </button>
      </div>

      {loading && <p style={{ color: "#2563eb", fontWeight: "bold" }}>Processing with TaxShield AI model...</p>}

      <pre style={{ background: "#1e293b", color: "#38bdf8", padding: "20px", borderRadius: "12px", overflowX: "auto", fontSize: "13px" }}>
        {response || "Click a button above to run a TaxShield AI analysis test..."}
      </pre>
    </div>
  );
}
