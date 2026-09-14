/**
 * History Service for past bill storage, retrieval, Firestore sync, and fuzzy price trend comparison.
 */
import { auth } from "../../config/firebase.js";
import api from "../api.js";

import { MOCK_BILLS } from "../../data/mockData.js";

const STORAGE_KEY = "taxshield_bill_history";
const UPDATE_EVENT = "taxshield:history-updated";

/**
 * Notify any listening page (e.g. the Spending dashboard) that history changed,
 * without requiring a full route remount or manual refresh.
 */
function notifyHistoryUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
}

/**
 * Normalize product/item names for fuzzy matching (e.g. "Paneer Tikka" vs "Paneer Tikka Platter")
 */
function normalizeName(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function saveBillToHistory(billAnalysis) {
  try {
    const existing = getBillHistory();
    const user = auth?.currentUser;
    const billId = billAnalysis.id || `bill-${Date.now()}`;
    const newRecord = {
      ...billAnalysis,
      id: billId,
      userId: user?.uid || "anonymous",
      timestamp: billAnalysis.timestamp || new Date().toISOString(),
      date: billAnalysis.date || new Date().toISOString().split("T")[0],
    };

    // Save to local storage cache
    if (typeof localStorage !== 'undefined') {
      const updated = [newRecord, ...existing.filter(b => b.id !== newRecord.id)].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    notifyHistoryUpdated();

    // Async sync to MongoDB via REST API
    api.createBill(newRecord).catch(err => console.warn("MongoDB bill save skipped/failed:", err.message));

    return newRecord;
  } catch (e) {
    console.error("Failed to save bill to local history:", e.message);
    return null;
  }
}

export function getBillHistory() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // FIX: MOCK_BILLS uses "platform" directly; fall back to a merchant-name
      // heuristic if it's missing — the old b.category === "Cafe" check was dead.
      const assignPlatform = (b) => {
        if (b.platform) return b.platform;
        const name = (b.merchant || "").toLowerCase();
        if (name.includes("swiggy")) return "Swiggy";
        if (name.includes("zomato")) return "Zomato";
        if (b.serviceCharge > 0) return "Direct";
        return "Zomato";
      };
      const initialBills = MOCK_BILLS.map(b => ({
        ...b,
        platform: assignPlatform(b),
        restaurantName: b.merchant || b.restaurantName,
        total: b.totalAmount || b.total,
        gst: b.taxes || b.gst,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBills));
      return initialBills;
    }
    return [];
  } catch (e) {
    console.error("Failed to read bill history:", e.message);
    return [];
  }
}

export async function fetchBillHistoryFromFirestore() {
  try {
    const docs = await api.getBills();
    if (Array.isArray(docs) && docs.length > 0 && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      return docs;
    }
  } catch (err) {
    console.warn("MongoDB bills fetch fallback to localStorage:", err.message);
  }
  return getBillHistory();
}
export const fetchBillHistoryFromDB = fetchBillHistoryFromFirestore;

/**
 * Live-subscribe to bill history so pages (e.g. Spending dashboard) update
 * automatically the moment a new bill is scanned.
 *
 * Returns an unsubscribe function — call it in your component's cleanup.
 */
export function subscribeToBillHistory(onChange) {
  // Always push the current local snapshot immediately so the UI has data on first paint
  onChange(getBillHistory());

  // Background fetch latest bills from MongoDB API
  api.getBills()
    .then((docs) => {
      if (Array.isArray(docs) && docs.length > 0) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        }
        onChange(docs);
      }
    })
    .catch((err) => {
      console.warn("MongoDB bill history fetch fallback:", err.message);
    });

  // Same-tab local saves (see notifyHistoryUpdated) and cross-tab localStorage changes
  const localHandler = () => onChange(getBillHistory());
  if (typeof window !== "undefined") {
    window.addEventListener(UPDATE_EVENT, localHandler);
    window.addEventListener("storage", localHandler);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(UPDATE_EVENT, localHandler);
      window.removeEventListener("storage", localHandler);
    }
  };
}

export function getBillById(id) {
  const history = getBillHistory();
  return history.find(b => b.id === id) || null;
}

export function findPastBillsByRestaurant(restaurantName) {
  if (!restaurantName || restaurantName === "Unknown") return [];
  const history = getBillHistory();
  const searchName = normalizeName(restaurantName);
  
  return history.filter(b => 
    b.restaurantName && normalizeName(b.restaurantName).includes(searchName)
  );
}

export function compareBillWithPast(currentBill) {
  const pastBills = findPastBillsByRestaurant(currentBill.restaurantName);
  if (pastBills.length === 0) {
    return {
      hasPreviousVisits: false,
      message: "First recorded visit to this establishment. No historical price comparison available."
    };
  }

  const previousBill = pastBills[0]; // Most recent prior visit
  const priceChanges = [];

  // Compare line items using fuzzy matching
  if (currentBill.lineItems && previousBill.lineItems) {
    currentBill.lineItems.forEach(currItem => {
      const currNorm = normalizeName(currItem.name);
      if (!currNorm) return;

      const match = previousBill.lineItems.find(p => {
        const pNorm = normalizeName(p.name);
        return pNorm && (pNorm.includes(currNorm) || currNorm.includes(pNorm));
      });

      const currPrice = Number(currItem.price || currItem.unitPrice || 0);
      const matchPrice = match ? Number(match.price || match.unitPrice || 0) : 0;

      if (match && matchPrice > 0 && currPrice > 0) {
        const diff = currPrice - matchPrice;
        if (diff !== 0) {
          const pct = ((diff / matchPrice) * 100).toFixed(1);
          priceChanges.push({
            itemName: currItem.name,
            oldPrice: matchPrice,
            newPrice: currPrice,
            diff,
            percentageChange: `${pct > 0 ? '+' : ''}${pct}%`
          });
        }
      }
    });
  }

  return {
    hasPreviousVisits: true,
    previousVisitDate: previousBill.timestamp || previousBill.date,
    previousBillId: previousBill.id,
    priceChanges,
    serviceChargeChanged: (currentBill.serviceCharge || 0) !== (previousBill.serviceCharge || 0)
  };
}
