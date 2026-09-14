import { analyzeWithGemini } from "./geminiAdapter.js";
import { analyzeWithClaude } from "./claudeAdapter.js";
import { analyzeWithCustomLlm } from "./customLlmAdapter.js";
import { analyzeWithNemotron } from "./nemotronAdapter.js";
import { saveBillToHistory, compareBillWithPast } from "./historyService.js";
import { verifyBillMath, buildMathFlags, auditShoppingTax, getTaxVerdict, canonicalBillType } from "./taxEngine.js";

/**
 * Clean markdown formatting (e.g. ```json ... ```) from raw LLM output
 */
export function extractAndParseJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid or empty LLM output text.");
  }
  let cleaned = rawText.trim();
  
  // Remove reasoning tags if present (e.g. <think>...</think> from reasoning models)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove markdown code fences if present
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  }

  // Extract strictly the outer JSON object boundaries
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt auto-sanitizing common local LLM minor JSON errors (trailing commas, smart quotes)
    try {
      const sanitized = cleaned
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      return JSON.parse(sanitized);
    } catch {
      console.error("JSON parsing error on raw LLM output:", rawText);
      throw new Error(`Failed to parse structured JSON from LLM response: ${err.message}`);
    }
  }
}

/**
 * Ensure all required TaxShield bill schema fields exist with defaults
 * Supports both new schema (platform, restaurant, items, tax, platformFee, extractionConfidence)
 * and legacy UI format (restaurantName, lineItems, totalAmount, cgst, sgst).
 */
export function normalizeBillData(parsedJson, options = {}) {
  // Reject non-bill documents and food dish images
  if (parsedJson.isReceiptOrBill === false || parsedJson.rejectionReason) {
    const reason = parsedJson.rejectionReason || "INVALID_IMAGE_FOOD_DETECTED: The uploaded image appears to be a photo of food dishes or non-receipt object, not a payment bill, receipt, or tax invoice.";
    throw new Error(reason);
  }

  // Detect or canonicalize bill type
  const rawBillType = parsedJson.billType || options.selectedBillType || "RESTAURANT";
  const billType = canonicalBillType(rawBillType);

  const platform = parsedJson.platform || "Direct";
  const retailer = parsedJson.retailer || parsedJson.restaurant || parsedJson.restaurantName || "Retail Store";
  const restaurantName = retailer; // backward-compatibility for existing UI references
  const establishmentType = parsedJson.establishmentType || (billType === "RESTAURANT" ? "STANDALONE_RESTAURANT" : "RETAIL_STORE");
  const orderId = parsedJson.orderId || null;
  const invoiceNumber = parsedJson.invoiceNumber || null;
  const date = parsedJson.date || new Date().toISOString().split("T")[0];
  const gstin = parsedJson.gstin || null;

  // Standardize Line Items (items vs lineItems)
  const rawItems = Array.isArray(parsedJson.items) 
    ? parsedJson.items 
    : (Array.isArray(parsedJson.lineItems) ? parsedJson.lineItems : []);

  // Reject if no items AND no financial totals whatsoever
  const hasTotal = Number(parsedJson.total || parsedJson.totalAmount || 0) > 0;
  const hasSubtotal = Number(parsedJson.subtotal || 0) > 0;
  if (rawItems.length === 0 && !hasTotal && !hasSubtotal) {
    throw new Error("INVALID_DOCUMENT: No payment or line item transaction details found in this image. Please upload a valid store receipt, shopping bill, or invoice.");
  }

  const lineItems = rawItems.map((item, idx) => {
    const qty = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const total = Number(item.total || (qty * unitPrice) || 0);
    return {
      id: item.id || `item-${idx + 1}`,
      name: String(item.name || `Line Item ${idx + 1}`),
      qty,
      quantity: qty,
      price: unitPrice,
      unitPrice,
      total,
      hsn: item.hsn ? String(item.hsn) : null,
      gstRate: item.gstRate !== undefined && item.gstRate !== null ? Number(item.gstRate) : null,
    };
  });

  const subtotal = Number(parsedJson.subtotal || 0);
  const discount = Number(parsedJson.discount || 0);
  const deliveryFee = Number(parsedJson.deliveryFee || 0);
  const packagingFee = Number(parsedJson.packagingFee || 0);
  const platformFee = Number(parsedJson.platformFee || 0);
  const serviceCharge = Number(parsedJson.serviceCharge || 0);

  // Extract Tax breakdown
  const taxObj = parsedJson.tax || {};
  const cgst = Number(taxObj.cgst !== undefined ? taxObj.cgst : (parsedJson.cgst || 0));
  const sgst = Number(taxObj.sgst !== undefined ? taxObj.sgst : (parsedJson.sgst || 0));
  const igst = Number(taxObj.igst !== undefined ? taxObj.igst : (parsedJson.igst || 0));
  const totalGst = Number(parsedJson.gst !== undefined ? parsedJson.gst : (cgst + sgst + igst));

  const totalAmount = Number(parsedJson.total || parsedJson.totalAmount || 0);
  const currency = parsedJson.currency || "INR";
  const extractionConfidence = parsedJson.extractionConfidence || "HIGH";
  const unreadableFields = Array.isArray(parsedJson.unreadableFields) ? parsedJson.unreadableFields : [];

  const isIllegalServiceCharge = Boolean(parsedJson.serviceChargeIllegal || (billType === "RESTAURANT" && serviceCharge > 0));
  const flags = Array.isArray(parsedJson.flags) ? [...parsedJson.flags] : [];
  const starRating = Number(parsedJson.starRating || (establishmentType === "LUXURY_HOTEL_RESTAURANT" ? 5 : 3));

  // 0. Deterministic math verification — the LLM never gets to self-certify its own total
  const verification = verifyBillMath({
    subtotal,
    discount,
    deliveryFee,
    packagingFee,
    platformFee,
    serviceCharge,
    cgst,
    sgst,
    igst,
    statedTotal: totalAmount,
    extractionConfidence,
  });
  flags.push(...buildMathFlags(verification));

  // 1. Audit Restaurant Service Charge Legality (CCPA Rules)
  if (billType === "RESTAURANT" && isIllegalServiceCharge && !flags.some(f => f.title?.toLowerCase().includes("service charge"))) {
    flags.unshift({
      type: "DANGER",
      title: "Illegal Voluntary Service Charge Included",
      description: `Service charge of ₹${serviceCharge} detected. Per CCPA consumer rules in India, restaurant service charges are voluntary and cannot be forced on customers.`
    });
  }

  // 2. Audit Platform / Packaging Fees
  if (platformFee > 0 && !flags.some(f => f.title?.toLowerCase().includes("platform fee"))) {
    flags.push({
      type: "INFO",
      title: `${platform} Convenience / Platform Fee`,
      description: `Platform fee of ₹${platformFee} charged by online app.`
    });
  }

  // 3. Tax Legality Audit (Restaurant vs Shopping)
  const calculatedGstPct = subtotal > 0 ? ((totalGst / subtotal) * 100) : 0;

  if (billType === "RESTAURANT") {
    if (establishmentType === "STANDALONE_RESTAURANT" || establishmentType === "BUDGET_HOTEL_RESTAURANT" || starRating < 5) {
      if (calculatedGstPct > 10 && !flags.some(f => f.title?.toLowerCase().includes("excessive gst"))) {
        flags.unshift({
          type: "DANGER",
          title: `Illegal Tax Overcharge: ${calculatedGstPct.toFixed(1)}% GST Charged`,
          description: `This establishment is classified as a ${starRating}-Star / ${establishmentType.replace(/_/g, ' ')}. Legally, food GST is capped at 5%. You were overcharged tax by ${(calculatedGstPct - 5).toFixed(1)}%.`
        });
      }
    } else if (establishmentType === "LUXURY_HOTEL_RESTAURANT" || starRating >= 5) {
      if (!flags.some(f => f.title?.toLowerCase().includes("5-star"))) {
        flags.push({
          type: "INFO",
          title: "5-Star Luxury Hotel Tax Bracket (18% GST)",
          description: "Verified establishment declared tariff ≥ ₹7,500/day. Legally subject to 18% GST with Input Tax Credit."
        });
      }
    }

    // Alcohol / Liquor Tax Verification
    const hasAlcohol = lineItems.some(item => 
      /beer|whisky|vodka|wine|cocktail|rum|gin|alcohol|liquor/i.test(item.name || "")
    );
    if (hasAlcohol && calculatedGstPct > 0 && !flags.some(f => f.title?.toLowerCase().includes("alcohol"))) {
      flags.push({
        type: "WARNING",
        title: "Alcohol Tax Exemption Verification Required",
        description: "Alcoholic beverages are exempt from Indian GST and subject to State Excise VAT. Verify that GST is not applied to liquor line items."
      });
    }
  } else {
    // Non-restaurant Shopping bills (supermarkets, Zudio, electronics, pharma, fuel)
    const shoppingAudit = auditShoppingTax({
      billType,
      items: lineItems,
      subtotal,
      cgst,
      sgst,
      igst,
      totalGst,
      statedTotal: totalAmount,
    });
    if (shoppingAudit.issues?.length > 0) {
      shoppingAudit.issues.forEach(iss => {
        if (!flags.some(f => f.title === iss.title)) {
          flags.push(iss);
        }
      });
    }
  }

  // 4. Unreadable Fields / Low Confidence Flagging
  if (extractionConfidence === "LOW" || unreadableFields.length > 0) {
    if (!flags.some(f => f.title?.toLowerCase().includes("extraction confidence"))) {
      flags.push({
        type: "WARNING",
        title: "Low Extraction Confidence / Unclear Receipts",
        description: `Unreadable or ambiguous fields detected: ${unreadableFields.join(", ") || "General receipt blur"}. Please double check manual values.`
      });
    }
  }

  // 5. Generate comprehensive Tax Verdict
  const taxVerdict = getTaxVerdict({
    billType,
    items: lineItems,
    cgst,
    sgst,
    igst,
    totalGst,
    subtotal,
    statedTotal: totalAmount,
    verification,
    legalAudit: { issues: flags },
  });

  // 6. Compute Consumer Safety & Legal Audit Score (0 to 100)
  let consumerScore = taxVerdict.score;
  if (isIllegalServiceCharge) consumerScore -= 15;
  if (verification.status === "discrepancy") consumerScore -= 20;
  if (extractionConfidence === "LOW") consumerScore -= 10;
  consumerScore = Math.max(10, Math.min(100, consumerScore));

  return {
    billType,
    category: billType,
    retailer,
    platform,
    restaurant: restaurantName,
    restaurantName,
    establishmentType,
    starRating,
    orderId,
    invoiceNumber,
    date,
    gstin,
    gstinValid: Boolean(gstin && gstin !== "Not Found" && gstin.length === 15),
    items: lineItems,
    lineItems,
    subtotal,
    discount,
    deliveryFee,
    packagingFee,
    platformFee,
    serviceCharge,
    serviceChargeIllegal: isIllegalServiceCharge,
    tax: { cgst, sgst, igst },
    gst: totalGst,
    cgst,
    sgst,
    igst,
    total: totalAmount,
    totalAmount,
    calculatedExpectedTotal: verification.expectedTotal,
    isTotalMatching: verification.isMatching,
    verificationStatus: verification.status, // 'verified' | 'discrepancy' | 'unable_to_verify'
    totalDifference: verification.difference,
    currency,
    extractionConfidence,
    unreadableFields,
    consumerScore,
    taxVerdict,
    flags,
    summary: parsedJson.summary || `${billType} bill from ${retailer}. Tax verdict: ${taxVerdict.badgeText} (${consumerScore}/100 score).`
  };
}

/**
 * Main LLM Gateway function for bill analysis
 */
export async function analyzeBill(billText, options = {}) {
  const startTime = Date.now();
  
  // Read active provider preference (localStorage overrides .env)
  const activeProvider = options.provider || 
    (typeof localStorage !== 'undefined' && localStorage.getItem("taxshield_llm_provider")) || 
    import.meta.env?.VITE_ACTIVE_LLM_PROVIDER || 
    "custom";

  const fallbackEnabled = options.fallbackEnabled !== false && 
    (import.meta.env?.VITE_LLM_FALLBACK_ENABLED !== "false");

  let adapterResult;
  let providerUsed = activeProvider;
  let isFallbackUsed = false;
  let fallbackReason = null;

  // Primary execution attempt
  try {
    if (activeProvider === "custom") {
      adapterResult = await analyzeWithCustomLlm(billText, options);
    } else if (activeProvider === "claude") {
      adapterResult = await analyzeWithClaude(billText, options);
    } else if (activeProvider === "nemotron") {
      adapterResult = await analyzeWithNemotron(billText, options);
    } else {
      adapterResult = await analyzeWithGemini(billText, options);
    }
  } catch (primaryError) {
    console.warn(`Primary LLM provider '${activeProvider}' failed:`, primaryError.message);

    if (!fallbackEnabled) {
      throw primaryError;
    }

    // Secondary execution fallback (Gemini Cloud)
    try {
      console.info("Initiating automatic fallback to Gemini cloud provider...");
      adapterResult = await analyzeWithGemini(billText, options);
      providerUsed = "gemini (fallback)";
      isFallbackUsed = true;
      fallbackReason = `Primary provider '${activeProvider}' offline or failed: ${primaryError.message}`;
    } catch (fallbackError) {
      throw new Error(`Primary (${activeProvider}) and Fallback (Gemini) providers both failed. Primary error: ${primaryError.message}. Fallback error: ${fallbackError.message}`);
    }
  }

  // Parse raw text to JSON
  const parsedJson = extractAndParseJson(adapterResult.rawText);
  const normalizedData = normalizeBillData(parsedJson, options);

  // Compare with historical visits
  const historicalComparison = compareBillWithPast(normalizedData);

  // Measure latency
  const latencyMs = Date.now() - startTime;
  const billId = `bill-${Date.now()}`;

  const result = {
    id: billId,
    timestamp: new Date().toISOString(),
    ...normalizedData,
    historicalComparison,
    meta: {
      providerRequested: activeProvider,
      providerUsed: isFallbackUsed ? providerUsed : adapterResult.provider,
      model: adapterResult.model,
      isFallbackUsed,
      fallbackReason,
      latencyMs
    }
  };

  // Automatically save to local history & trigger live subscription events
  const savedRecord = saveBillToHistory(result);

  return savedRecord || result;
}
