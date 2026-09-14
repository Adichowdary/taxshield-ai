import { app, auth } from "../config/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(app);

export const analyzeBillSecureCallable = httpsCallable(functions, "analyzeBillSecure");
export const getAnalyticsOverviewCallable = httpsCallable(functions, "getAnalyticsOverview");
export const deleteBillCallable = httpsCallable(functions, "deleteBill");

/**
 * Analyze a bill via the server-side Gemini proxy — no API key ever ships to
 * the browser. Prefer this over the client-side geminiAdapter/claudeAdapter
 * once functions are deployed (see functions/index.js).
 */
export async function executeAnalyzeBillSecure({ billText, imageBase64, mimeType } = {}) {
  const res = await analyzeBillSecureCallable({ billText, imageBase64, mimeType });
  return res.data; // { rawText, provider, model }
}

/**
 * Fetch monthly analytics overview snapshot
 */
export async function executeGetAnalyticsOverview() {
  const user = auth.currentUser;
  if (!user) {
    return { totalSpending: 0, totalTax: 0, totalFees: 0, orderCount: 0 };
  }

  try {
    const res = await getAnalyticsOverviewCallable({});
    return res.data;
  } catch (err) {
    console.warn("Cloud function getAnalyticsOverview fallback:", err.message);
    return { totalSpending: 0, totalTax: 0, totalFees: 0, orderCount: 0 };
  }
}
