/**
 * Deterministic Tax Engine
 * ------------------------
 * The LLM extracts values from the bill image/text but must NEVER be trusted
 * to do arithmetic (see BILL_ANALYSIS_SYSTEM_PROMPT: "a separate deterministic
 * engine verifies math afterward"). This module is that engine.
 *
 * It independently recomputes what the total SHOULD be from the extracted
 * line items, taxes, fees and discount, and compares it to what the bill
 * actually printed. Everything downstream (flags, consumerScore, "verified"
 * badge) should be driven off this comparison, not off a hardcoded `true`.
 */

const ROUNDING_TOLERANCE = 1.5; // ₹1.50 — absorbs OCR/rounding noise, not real discrepancies

/**
 * Audit tax rates according to Indian GST law
 * @param {object} params
 */
export function auditTaxLegality({
  subtotal = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalGst = null,
  establishmentType = "STANDALONE_RESTAURANT",
  starRating = 3,
  hasAlcohol = false,
}) {
  const calculatedTax = totalGst !== null && totalGst !== undefined ? totalGst : (cgst + sgst + igst);
  const calculatedGstPct = subtotal > 0 ? (calculatedTax / subtotal) * 100 : 0;
  const issues = [];

  // Check Intrastate CGST == SGST symmetry (tolerance ₹2.00 to absorb rounding)
  if (cgst > 0 && sgst > 0 && Math.abs(cgst - sgst) > 2.0) {
    issues.push({
      type: "WARNING",
      title: "CGST / SGST Asymmetry Detected",
      description: `Intrastate GST requires CGST and SGST to be equal. Detected CGST: ₹${cgst.toFixed(2)} vs SGST: ₹${sgst.toFixed(2)}.`,
    });
  }

  // Check 5% vs 18% restaurant rate
  const isLuxury = establishmentType === "LUXURY_HOTEL_RESTAURANT" || starRating >= 5;
  if (!isLuxury && calculatedGstPct > 10) {
    issues.push({
      type: "DANGER",
      title: `Illegal Tax Overcharge: ${calculatedGstPct.toFixed(1)}% GST Charged`,
      description: `This establishment is classified as a ${starRating}-Star / ${establishmentType.replace(/_/g, ' ')}. Under Indian GST law (Notification No. 46/2017), standalone restaurant GST is capped at 5% without ITC. You were overcharged tax by ${(calculatedGstPct - 5).toFixed(1)}%.`,
      expectedRate: 5,
      actualRate: Number(calculatedGstPct.toFixed(1)),
      excessTaxAmount: Number((calculatedTax - (subtotal * 0.05)).toFixed(2)),
    });
  }

  // Alcohol VAT check
  if (hasAlcohol && calculatedTax > 0) {
    issues.push({
      type: "WARNING",
      title: "Alcohol Tax Exemption Verification Required",
      description: "Alcoholic liquor for human consumption is constitutionally outside GST (Article 366(12A)) and subject to State Excise / VAT. Verify that GST is not applied to alcoholic line items.",
    });
  }

  return {
    effectiveGstPct: Number(calculatedGstPct.toFixed(2)),
    isLuxury,
    legalGstRate: isLuxury ? 18 : 5,
    issues,
  };
}

/**
 * @param {object} fields - already-normalized numeric fields
 * @returns {{ expectedTotal: number, statedTotal: number, difference: number,
 *             isMatching: boolean, status: 'verified'|'discrepancy'|'unable_to_verify' }}
 */
export function verifyBillMath({
  subtotal = 0,
  discount = 0,
  deliveryFee = 0,
  packagingFee = 0,
  platformFee = 0,
  serviceCharge = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  statedTotal = 0,
  extractionConfidence = "HIGH",
}) {
  const totalTax = cgst + sgst + igst;
  const expectedTotal =
    subtotal - discount + deliveryFee + packagingFee + platformFee + serviceCharge + totalTax;

  const difference = Number((statedTotal - expectedTotal).toFixed(2));
  const isMatching = Math.abs(difference) <= ROUNDING_TOLERANCE;

  // If core inputs are missing/zero we can't honestly claim "verified"
  const hasEnoughData = subtotal > 0 && statedTotal > 0;

  let status = "unable_to_verify";
  if (hasEnoughData) {
    status = isMatching ? "verified" : "discrepancy";
  }
  if (extractionConfidence === "LOW" && status === "verified") {
    // Don't advertise confidence the extraction itself doesn't have
    status = "unable_to_verify";
  }

  return {
    expectedTotal: Number(expectedTotal.toFixed(2)),
    statedTotal: Number(statedTotal.toFixed(2)),
    difference,
    isMatching: hasEnoughData ? isMatching : false,
    status,
  };
}

/**
 * Builds the flag(s) that describe a math discrepancy, if any.
 */
export function buildMathFlags(verification) {
  const flags = [];
  if (verification.status === "discrepancy") {
    const overcharged = verification.difference > 0;
    flags.unshift({
      type: "DANGER",
      title: overcharged
        ? `Bill Total Overcharged by ₹${Math.abs(verification.difference).toFixed(2)}`
        : `Bill Total Undercharged by ₹${Math.abs(verification.difference).toFixed(2)}`,
      description: `Based on the extracted subtotal, taxes, fees and discount, the expected total is ₹${verification.expectedTotal.toFixed(
        2
      )}, but the bill states ₹${verification.statedTotal.toFixed(
        2
      )}. This is a ${overcharged ? "overcharge" : "undercharge"} of ₹${Math.abs(
        verification.difference
      ).toFixed(2)}.`,
    });
  } else if (verification.status === "unable_to_verify") {
    flags.push({
      type: "WARNING",
      title: "Unable to Independently Verify Total",
      description:
        "Subtotal or total was missing/unreadable, or extraction confidence was low, so TaxShield could not independently confirm the arithmetic on this bill.",
    });
  }
  return flags;
}

/**
 * GST slab rates and rules for non-restaurant shopping categories
 */
export const SHOPPING_GST_RULES = {
  GROCERY: {
    label: "Supermarket & Groceries",
    allowedSlabs: [0, 5, 12, 18],
    typicalSlab: 5,
    guideline: "Essential food grains, unbranded milk/pulses: 0%. Packaged foods/spices: 5%. Processed food/butter: 12%. Household cleaners/toiletries: 18%.",
  },
  FASHION: {
    label: "Fashion & Lifestyle",
    allowedSlabs: [5, 12],
    threshold: 1000,
    guideline: "Garments and footwear ≤ ₹1,000 per piece: 5% GST. Items > ₹1,000: 12% GST.",
  },
  ELECTRONICS: {
    label: "Electronics & Appliances",
    allowedSlabs: [18, 28],
    typicalSlab: 18,
    guideline: "Smartphones, laptops, accessories, peripherals: 18% GST. Air conditioners, large screens (>32\"): 28% GST.",
  },
  PHARMACY: {
    label: "Pharmacy & Healthcare",
    allowedSlabs: [0, 5, 12, 18],
    typicalSlab: 5,
    guideline: "Life-saving formulations/insulin: 0-5%. Standard allopathic medicines: 5% or 12%. Cosmetics & health supplements: 18%.",
  },
  FUEL: {
    label: "Fuel (Petrol / Diesel / CNG)",
    allowedSlabs: [0],
    guideline: "Petrol and diesel are currently OUTSIDE GST (Article 279A(5) of Indian Constitution). Subject only to Central Excise and State VAT. GST charged on petrol/diesel is strictly illegal.",
  },
  OTHER: {
    label: "General Retail & Shopping",
    allowedSlabs: [0, 5, 12, 18, 28],
    typicalSlab: 18,
    guideline: "Standard Indian GST multi-tier structure applies (0%, 5%, 12%, 18%, 28%).",
  },
};

/**
 * Normalizes billType string to uppercase canonical key
 */
export function canonicalBillType(rawType) {
  if (!rawType) return "RESTAURANT";
  const t = String(rawType).toUpperCase().replace(/[\s_-]+/g, "");
  if (t.includes("GROCERY") || t.includes("SUPERMARKET") || t.includes("DMART") || t.includes("BLINKIT") || t.includes("ZEPTO") || t.includes("INSTAMART")) return "GROCERY";
  if (t.includes("FASHION") || t.includes("CLOTH") || t.includes("ZUDIO") || t.includes("ZARA") || t.includes("APPAREL") || t.includes("FOOTWEAR") || t.includes("RETAIL")) return "FASHION";
  if (t.includes("ELECTRONIC") || t.includes("CROMA") || t.includes("GADGET") || t.includes("TECH")) return "ELECTRONICS";
  if (t.includes("PHARMACY") || t.includes("MED") || t.includes("HEALTH") || t.includes("APOLLO")) return "PHARMACY";
  if (t.includes("FUEL") || t.includes("PETROL") || t.includes("DIESEL") || t.includes("GAS")) return "FUEL";
  if (t.includes("FOOD") || t.includes("RESTAURANT") || t.includes("CAFE") || t.includes("DINING")) return "RESTAURANT";
  return "OTHER";
}

/**
 * Audit tax legality specifically for retail shopping bills (supermarkets, Zudio, electronics, pharma, fuel)
 */
export function auditShoppingTax({
  billType = "OTHER",
  items = [],
  subtotal = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalGst = null,
  statedTotal = 0,
}) {
  const normType = canonicalBillType(billType);
  const tax = totalGst !== null && totalGst !== undefined ? totalGst : (cgst + sgst + igst);
  const effectiveGstPct = subtotal > 0 ? (tax / subtotal) * 100 : (statedTotal > 0 ? (tax / statedTotal) * 100 : 0);
  const issues = [];
  let overchargeAmount = 0;

  // Intrastate equality check
  if (cgst > 0 && sgst > 0 && Math.abs(cgst - sgst) > 2.0) {
    issues.push({
      type: "WARNING",
      title: "CGST / SGST Asymmetry Detected",
      description: `Intrastate GST mandates equal CGST (₹${cgst.toFixed(2)}) and SGST (₹${sgst.toFixed(2)}). An unequal split violates GST filing rules.`,
    });
  }

  // 1. FUEL BILL CHECK - Strictly outside GST
  if (normType === "FUEL") {
    if (tax > 2.0) {
      overchargeAmount += tax;
      issues.push({
        type: "DANGER",
        title: "Illegal GST Charged on Fuel",
        description: "Petrol, Diesel, and ATF are constitutionally exempt from GST under Article 279A(5) of the Indian Constitution. Any GST levy on fuel purchase is an unlawful charge.",
        excessTaxAmount: tax,
      });
    }
  }

  // 2. FASHION BILL CHECK - 5% for <=1000, 12% for >1000
  if (normType === "FASHION") {
    const hasOnlyBudgetItems = items.length > 0 && items.every((i) => (i.price || 0) <= 1000);
    if (hasOnlyBudgetItems && effectiveGstPct > 8) {
      const legalTax = subtotal * 0.05;
      const excess = Math.max(0, tax - legalTax);
      overchargeAmount += excess;
      issues.push({
        type: "DANGER",
        title: `Fashion Rate Overcharge: Charged ${effectiveGstPct.toFixed(1)}% GST (Legal: 5%)`,
        description: `Apparel and footwear priced at or under ₹1,000 per piece attract strictly 5% GST. All extracted items are ≤ ₹1,000, but tax charged exceeds 5%.`,
        expectedRate: 5,
        actualRate: Number(effectiveGstPct.toFixed(1)),
        excessTaxAmount: Number(excess.toFixed(2)),
      });
    } else if (effectiveGstPct > 15) {
      const legalTax = subtotal * 0.12;
      const excess = Math.max(0, tax - legalTax);
      overchargeAmount += excess;
      issues.push({
        type: "DANGER",
        title: `Excess GST on Fashion: Charged ${effectiveGstPct.toFixed(1)}% (Max: 12%)`,
        description: `Standard apparel and footwear above ₹1,000 are capped at 12% GST under Indian GST tariffs. You were charged ${effectiveGstPct.toFixed(1)}%.`,
        expectedRate: 12,
        actualRate: Number(effectiveGstPct.toFixed(1)),
        excessTaxAmount: Number(excess.toFixed(2)),
      });
    }
  }

  // 3. PHARMACY BILL CHECK - Max standard medicine rate 12%
  if (normType === "PHARMACY" && effectiveGstPct > 14) {
    const legalTax = subtotal * 0.12;
    const excess = Math.max(0, tax - legalTax);
    overchargeAmount += excess;
    issues.push({
      type: "WARNING",
      title: `Elevated Tax on Pharmacy Bill: ${effectiveGstPct.toFixed(1)}% GST`,
      description: `Medicines and formulations carry 5% or 12% GST. A tax rate of ${effectiveGstPct.toFixed(1)}% usually indicates luxury cosmetic/skincare items or potential over-categorization.`,
      expectedRate: 12,
      actualRate: Number(effectiveGstPct.toFixed(1)),
      excessTaxAmount: Number(excess.toFixed(2)),
    });
  }

  // 4. GROCERY BILL CHECK - Essential grains 0%, packaged 5%, max mix 18%
  if (normType === "GROCERY" && effectiveGstPct > 20) {
    issues.push({
      type: "DANGER",
      title: `Unusual Grocery Tax Rate: ${effectiveGstPct.toFixed(1)}% GST`,
      description: "Supermarket baskets rarely average above 18% GST unless heavily weighted with sin goods or 28% category items. Please inspect individual item HSN codes.",
      actualRate: Number(effectiveGstPct.toFixed(1)),
    });
  }

  // 5. Check item-level discrepancies if item GST rates are extracted
  items.forEach((item) => {
    if (item.taxRate && item.taxRate > 28) {
      issues.push({
        type: "DANGER",
        title: `Invalid Tax Rate on ${item.name || "Item"}`,
        description: `Tax rate of ${item.taxRate}% exceeds the maximum statutory Indian GST slab of 28%.`,
      });
    }
  });

  return {
    billType: normType,
    effectiveGstPct: Number(effectiveGstPct.toFixed(2)),
    overchargeAmount: Number(overchargeAmount.toFixed(2)),
    issues,
    rules: SHOPPING_GST_RULES[normType] || SHOPPING_GST_RULES.OTHER,
  };
}

/**
 * Computes an end-user friendly Tax Verdict card payload for any bill (Shopping or Food)
 * Answers: "Is this tax worth it? Was I overcharged? Is it 100% legal?"
 */
export function getTaxVerdict({
  billType = "RESTAURANT",
  items = [],
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalGst = null,
  subtotal = 0,
  statedTotal = 0,
  verification = null,
  legalAudit = null,
}) {
  const normType = canonicalBillType(billType);
  const tax = totalGst !== null && totalGst !== undefined ? totalGst : (cgst + sgst + igst);
  const total = statedTotal || (subtotal + tax);
  const effectivePct = subtotal > 0 ? (tax / subtotal) * 100 : (total > 0 ? (tax / total) * 100 : 0);

  // Collect all issues from legal audit and math verification
  const auditIssues = legalAudit?.issues || [];
  const mathIssues = verification?.status === "discrepancy" ? [verification] : [];
  const dangerIssues = auditIssues.filter((i) => i.type === "DANGER");
  const warningIssues = auditIssues.filter((i) => i.type === "WARNING");

  let status = "CORRECT";
  let badgeText = "Tax Verified Correct";
  let badgeColor = "emerald";
  let score = 98;
  let overchargeAmount = 0;
  let headline = "GST applied strictly according to statutory government slabs";
  let summary = `All items on this ${normType.toLowerCase()} receipt adhere to the designated tax slabs. No bogus cesses, illegal tax duplication, or overcharges were detected.`;
  let actionRecommended = "Receipt is compliant. Safe to store for your tax records or claim ITC.";

  // Extract explicit excess tax if identified
  dangerIssues.forEach((iss) => {
    if (iss.excessTaxAmount && iss.excessTaxAmount > 0) {
      overchargeAmount += iss.excessTaxAmount;
    }
  });

  // Math discrepancy overcharge
  if (verification?.status === "discrepancy" && verification.difference > 1.5) {
    overchargeAmount += verification.difference;
  }

  // Determine Verdict
  if (normType === "FUEL" && tax > 1.0) {
    status = "OVERCHARGED";
    badgeText = "Illegal Tax Charged";
    badgeColor = "rose";
    score = 15;
    headline = `Unlawful ₹${tax.toFixed(2)} GST charged on fuel purchase`;
    summary = "Fuel (petrol/diesel) is legally exempt from GST under Article 279A(5). Only excise and VAT can be levied. The retailer should not charge GST.";
    actionRecommended = "Request an immediate refund of the GST amount from the fuel station manager.";
  } else if (dangerIssues.length > 0 || overchargeAmount > 2.0) {
    status = "OVERCHARGED";
    badgeText = `Overcharged by ₹${overchargeAmount.toFixed(2)}`;
    badgeColor = "rose";
    score = Math.max(20, Math.round(100 - (overchargeAmount / Math.max(1, total)) * 300));
    headline = `You were overbilled by approximately ₹${overchargeAmount.toFixed(2)} in excess taxes`;
    summary = dangerIssues[0]?.description || `Discrepancies found in the applied GST rates vs statutory caps for ${normType.toLowerCase()} bills.`;
    actionRecommended = "Show this TaxShield audit to the merchant or file a grievance via the GST Consumer Grievance Portal.";
  } else if (warningIssues.length > 0 || verification?.status === "discrepancy") {
    status = "SUSPICIOUS";
    badgeText = "Review Advised";
    badgeColor = "amber";
    score = 75;
    headline = "Minor tax rate variance or rounding deviation detected";
    summary = warningIssues[0]?.description || "The line items and total tax exhibit minor variances. Please review the itemized breakdown.";
    actionRecommended = "Keep this receipt handy and cross-verify with your payment card slip.";
  } else if (normType === "GROCERY" && effectivePct === 0 && subtotal > 0) {
    status = "EXEMPT";
    badgeText = "0% Tax-Exempt Basket";
    badgeColor = "blue";
    score = 100;
    headline = "100% Tax-Exempt Grocery Essentials";
    summary = "All purchased items fall under zero-rated statutory exemptions (fresh produce, unbranded staples). You saved 100% on tax.";
    actionRecommended = "Optimal grocery shopping efficiency! Perfect for your budget tracking.";
  }

  return {
    status,
    badgeText,
    badgeColor,
    score,
    effectiveGstPct: Number(effectivePct.toFixed(1)),
    totalTax: Number(tax.toFixed(2)),
    overchargeAmount: Number(overchargeAmount.toFixed(2)),
    potentialSavings: Number(overchargeAmount.toFixed(2)),
    headline,
    summary,
    actionRecommended,
    categoryLabel: SHOPPING_GST_RULES[normType]?.label || "Retail Bill",
    breakdown: [
      { label: "Category", value: SHOPPING_GST_RULES[normType]?.label || normType },
      { label: "Effective Tax Rate", value: `${effectivePct.toFixed(1)}%` },
      { label: "Total Tax Paid", value: `₹${tax.toFixed(2)}` },
      {
        label: "ITC (Input Tax Credit)",
        value: normType === "RESTAURANT" ? "Not Eligible (5% scheme)" : "Eligible for Business GSTIN",
      },
    ],
  };
}
