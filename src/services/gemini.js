/**
 * TaxShield Service Layer - Backward Compatible Export
 * Delegates to the Multi-Provider LLM Gateway
 */

import { analyzeBill as gatewayAnalyzeBill } from "./llm/llmGateway";

export async function analyzeBill(text, options = {}) {
  return gatewayAnalyzeBill(text, options);
}

export { gatewayAnalyzeBill };