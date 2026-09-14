import { verifyBillMath, buildMathFlags, auditTaxLegality } from "../src/services/llm/taxEngine.js";

console.log("==================================================================");
console.log("      TAXSHIELD AI - DETERMINISTIC TAX ENGINE UNIT TESTS          ");
console.log("==================================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

// Test 1: Clean Math Verified Bill
const test1 = verifyBillMath({
  subtotal: 1000,
  discount: 100,
  deliveryFee: 40,
  packagingFee: 20,
  platformFee: 5,
  serviceCharge: 0,
  cgst: 25,
  sgst: 25,
  igst: 0,
  statedTotal: 1015, // 1000 - 100 + 40 + 20 + 5 + 0 + 50 = 1015
  extractionConfidence: "HIGH"
});
assert(test1.status === "verified", "Clean bill math status is 'verified'");
assert(test1.isMatching === true, "Clean bill isMatching is true");
assert(test1.difference === 0, "Clean bill difference is 0");

// Test 2: Bill with Math Overcharge Discrepancy
const test2 = verifyBillMath({
  subtotal: 500,
  discount: 0,
  deliveryFee: 0,
  packagingFee: 0,
  platformFee: 0,
  serviceCharge: 0,
  cgst: 12.5,
  sgst: 12.5,
  igst: 0,
  statedTotal: 550, // Expected is 525, overcharged by 25
  extractionConfidence: "HIGH"
});
assert(test2.status === "discrepancy", "Overcharged bill status is 'discrepancy'");
assert(test2.isMatching === false, "Overcharged bill isMatching is false");
assert(test2.difference === 25, "Overcharged difference is exactly 25.00");
const flags2 = buildMathFlags(test2);
assert(flags2.length > 0 && flags2[0].type === "DANGER", "Math flag created with DANGER severity");

// Test 3: Standalone Restaurant with Illegal 18% GST Overcharge
const test3 = auditTaxLegality({
  subtotal: 1000,
  cgst: 90,
  sgst: 90,
  igst: 0,
  establishmentType: "STANDALONE_RESTAURANT",
  starRating: 3,
  hasAlcohol: false
});
assert(test3.issues.length > 0, "Illegal 18% GST on standalone restaurant caught");
assert(test3.issues[0].actualRate === 18, "Actual rate calculated as 18%");
assert(test3.issues[0].expectedRate === 5, "Expected rate identified as 5%");
assert(test3.issues[0].excessTaxAmount === 130, "Excess tax calculated as ₹130 (180 - 50)");

// Test 4: CGST != SGST Asymmetry
const test4 = auditTaxLegality({
  subtotal: 1000,
  cgst: 25,
  sgst: 35, // Asymmetry
  igst: 0,
  establishmentType: "STANDALONE_RESTAURANT",
  starRating: 3
});
assert(test4.issues.some(i => i.title.includes("Asymmetry")), "CGST vs SGST asymmetry detected");

// Test 5: Low Extraction Confidence
const test5 = verifyBillMath({
  subtotal: 500,
  discount: 0,
  deliveryFee: 0,
  packagingFee: 0,
  platformFee: 0,
  serviceCharge: 0,
  cgst: 12.5,
  sgst: 12.5,
  igst: 0,
  statedTotal: 525,
  extractionConfidence: "LOW"
});
assert(test5.status === "unable_to_verify", "LOW confidence bill falls back safely to 'unable_to_verify'");

console.log("\n==================================================================");
console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All TaxEngine unit tests passed with 100% precision!");
}
