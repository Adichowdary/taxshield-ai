/**
 * TaxShield Cloud Functions
 * -------------------------
 * These were declared as callable functions on the client
 * (uploadBill / getAnalyticsOverview / deleteBill) but never actually
 * implemented here — every call silently failed and fell back to zeros.
 * That's the real reason the Spending dashboard looked "stuck": there was
 * nothing on the other end.
 *
 * This file also fixes the bigger issue: the client (Vite/React) was
 * calling Gemini/Claude directly from the browser with API keys baked
 * into the bundle via VITE_* env vars. Anything prefixed VITE_ is inlined
 * into the JS shipped to every visitor's browser — open devtools -> Sources
 * and the key is sitting there in plaintext. That's very likely why keys
 * "stop working": once a key is exposed publicly, providers auto-revoke it.
 *
 * Deploy: firebase deploy --only functions
 * Then set your real key with:
 *   firebase functions:secrets:set GEMINI_API_KEY
 * (never put it in .env / VITE_GEMINI_API_KEY again)
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const BILL_ANALYSIS_SYSTEM_PROMPT = `You are a bill-extraction and document classification engine for TaxShield. Extract structured data from Indian restaurant bills, tax invoices, and food-delivery payment receipts. If the input is a PHOTO OF FOOD (dish/meal without bill text) or non-bill image, set "isReceiptOrBill": false, "rejectionReason": "FOOD_IMAGE_DETECTED: Uploaded image appears to be food/dish photo rather than a payment bill.", and numeric fields to 0. If it is a valid bill/receipt, set "isReceiptOrBill": true, "rejectionReason": null. Do NOT calculate or infer values that are not printed — a deterministic engine verifies math afterward. Return ONLY JSON, no markdown fences, matching: {"isReceiptOrBill":boolean,"rejectionReason":string|null,"platform":string,"restaurant":string|null,"establishmentType":string,"orderId":string|null,"invoiceNumber":string|null,"date":string|null,"gstin":string|null,"items":[{"name":string,"quantity":number,"unitPrice":number,"total":number}],"subtotal":number,"discount":number,"deliveryFee":number,"packagingFee":number,"platformFee":number,"serviceCharge":number,"tax":{"cgst":number,"sgst":number,"igst":number},"total":number,"currency":"INR","extractionConfidence":"HIGH|MEDIUM|LOW","unreadableFields":[string]}`;

/**
 * Securely analyze a bill using Gemini. The API key never leaves the server.
 * Call from the client with: httpsCallable(functions, "analyzeBillSecure")
 */
exports.analyzeBillSecure = onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const { billText, imageBase64, mimeType } = request.data || {};
    if (!billText && !imageBase64) {
      throw new HttpsError("invalid-argument", "billText or imageBase64 is required.");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: BILL_ANALYSIS_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json", temperature: 0.0 },
    });

    const parts = [];
    if (imageBase64) {
      parts.push({ inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } });
      parts.push("Extract all structured line items, taxes, fees, and totals from this bill receipt image.");
    } else {
      parts.push(`Analyze this bill text:\n${billText}`);
    }

    try {
      const result = await model.generateContent(parts);
      const rawText = result.response.text();
      return { rawText, provider: "gemini", model: "gemini-2.0-flash" };
    } catch (err) {
      console.error("Gemini call failed:", err);
      throw new HttpsError("internal", `LLM provider error: ${err.message}`);
    }
  }
);

/**
 * Real analytics aggregation, computed from the caller's own bills — this
 * is what was missing. Replaces the old stub that always returned zeros.
 */
exports.getAnalyticsOverview = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const uid = request.auth.uid;

  const snap = await db.collection("bills").where("userId", "==", uid).get();
  if (snap.empty) {
    return { totalSpending: 0, totalTax: 0, totalFees: 0, orderCount: 0 };
  }

  let totalSpending = 0;
  let totalTax = 0;
  let totalFees = 0;
  snap.forEach((doc) => {
    const b = doc.data();
    totalSpending += Number(b.totalAmount ?? b.total ?? 0);
    totalTax += Number(b.gst ?? 0);
    totalFees += Number(b.serviceCharge ?? 0);
  });

  return {
    totalSpending: Number(totalSpending.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    orderCount: snap.size,
  };
});

/**
 * Deletes a bill the caller owns (was declared client-side, never implemented).
 */
exports.deleteBill = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const { billId } = request.data || {};
  if (!billId) {
    throw new HttpsError("invalid-argument", "billId is required.");
  }

  const ref = db.collection("bills").doc(billId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Not your bill.");
  }
  await ref.delete();
  return { success: true };
});
