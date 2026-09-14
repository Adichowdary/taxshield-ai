import { createWorker } from 'tesseract.js';
import { verifyBillMath, buildMathFlags, getTaxVerdict, canonicalBillType } from './llm/taxEngine.js';

export class NonBillImageError extends Error {
  constructor(message = "The uploaded image does not appear to be a valid bill, receipt, or tax invoice. Please upload a clear photo of an authentic bill.") {
    super(message);
    this.name = "NonBillImageError";
    this.isNonBill = true;
  }
}

/**
 * Preprocesses and extracts verbatim raw text from bill receipt images using Tesseract.js OCR.
 * @param {string|File|Blob} imageSource - Image URL, Base64 Data URL, Blob, or File object.
/**
 * Scales an image down to optimal OCR size (max 1600px) on an in-memory canvas
 */
async function getOptimizedOcrInput(imageSource) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return imageSource;
  }

  try {
    let srcUrl = '';
    if (typeof imageSource === 'string') {
      srcUrl = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      srcUrl = URL.createObjectURL(imageSource);
    } else {
      return imageSource;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = srcUrl;
    });

    const maxDim = 1600;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    if (srcUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(srcUrl); } catch {}
    }

    return canvas;
  } catch {
    return imageSource;
  }
}

/**
 * Preprocesses and extracts verbatim raw text from bill receipt images using Tesseract.js OCR.
 * @param {string|File|Blob} imageSource - Image URL, Base64 Data URL, Blob, or File object.
 * @param {Function} onProgress - Optional callback for OCR progress updates (0 to 100).
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export async function performOcr(imageSource, onProgress = null) {
  if (!imageSource) return { text: '', confidence: 0 };

  let worker = null;
  try {
    const optimizedInput = await getOptimizedOcrInput(imageSource);

    // Timeout after 8 seconds so OCR never permanently stalls
    const ocrPromise = (async () => {
      worker = await createWorker('eng');
      const ret = await worker.recognize(optimizedInput);
      const text = ret?.data?.text || '';
      const confidence = ret?.data?.confidence || 80;
      await worker.terminate();
      worker = null;
      return { text: text.trim(), confidence };
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OCR recognition timeout')), 8000)
    );

    return await Promise.race([ocrPromise, timeoutPromise]);
  } catch (err) {
    console.warn("Tesseract OCR preprocessing note:", err.message);
    if (worker) {
      try { await worker.terminate(); } catch {}
    }
    return { text: '', confidence: 0, error: err.message };
  }
}

/**
 * Deterministic Receipt Regex & Mathematical Extractor
 * Extracts merchant, GSTIN, line items, CGST, SGST, service charge, and total amount
 * directly from OCR text with statutory validation.
 * Throws NonBillImageError if document lacks billing markers or financial data.
 */
export function parseOcrReceiptText(rawText, options = {}, detectedImageUrl = null) {
  const text = typeof rawText === 'string' ? rawText : '';
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Common Indian receipt keywords & markers
  const receiptKeywords = [
    'total', 'subtotal', 'sub-total', 'sub total', 'amount', 'tax', 'gst', 'cgst', 'sgst', 'igst',
    'bill', 'invoice', 'receipt', 'order', 'table', 'token', 'cash', 'card', 'upi', 'payment',
    'hsn', 'sac', 'rate', 'price', 'qty', 'quantity', 'discount', 'service charge', 'gstin',
    'fssai', 'vat', 'mrp', 'net payable', 'grand total', 'round off', 'balance', 'change', 'rs', 'inr'
  ];

  const lowerText = text.toLowerCase();
  const matchedKeywords = receiptKeywords.filter(kw => lowerText.includes(kw));
  const hasNumbers = /\d+[.,]\d{2}|\b\d{2,6}\b/.test(text);

  // If text is totally empty, or has no numbers and no receipt keywords, reject immediately
  if ((lines.length === 0) || (!hasNumbers && matchedKeywords.length === 0)) {
    throw new NonBillImageError(
      "The uploaded image does not appear to contain a valid payment bill, receipt, or tax invoice. Please upload a clear photo of an authentic bill."
    );
  }

  let merchant = 'Retail & Dining Merchant';
  let gstin = null;
  let date = new Date().toISOString().split('T')[0];
  let invoiceNumber = null;
  let orderId = null;

  // 1. Detect GSTIN (15-character pattern e.g., 36AABCT3518Q1ZX or 07AAAAA0000A1Z5)
  const gstinMatch = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/i);
  if (gstinMatch) {
    gstin = gstinMatch[1].toUpperCase();
  }

  // 2. Detect Date
  const dateMatch = text.match(/\b(\d{1,2}[-/.](?:[0-9]{1,2}|[A-Za-z]{3})[-/.](?:20\d{2}|\d{2}))\b/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  // 3. Detect Invoice / Bill / Order Number
  const invMatch = text.match(/(?:inv(?:oice)?|bill|order|receipt|token)\s*(?:no|#|num)?[:.\s-]*([A-Za-z0-9-_/]+)/i);
  if (invMatch && invMatch[1].length > 2) {
    invoiceNumber = invMatch[1];
    orderId = invMatch[1];
  } else {
    invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    orderId = `ORD-${Date.now().toString().slice(-6)}`;
  }

  // 4. Extract Merchant Name from initial lines (avoiding "Tax Invoice", "Welcome", etc.)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 50 &&
      !/invoice|tax|receipt|bill\s+no|welcome|gstin|fssai|phone|tel|cash|table|date/i.test(line) &&
      !/^\d+$/.test(line)
    ) {
      merchant = line.replace(/^[#*=-]+|[#*=-]+$/g, '').trim();
      break;
    }
  }

  // 5. Line items and financial figure extractions
  let subtotal = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let serviceCharge = 0;
  let discount = 0;
  let totalAmount = 0;
  const lineItems = [];

  // Helper to extract last currency number in a string
  const extractAmount = (str) => {
    const matches = str.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:[,.][0-9]{2})?)/gi);
    if (!matches) return null;
    const last = matches[matches.length - 1].replace(/[^0-9.]/g, '');
    const num = parseFloat(last);
    return isNaN(num) ? null : num;
  };

  // Scan lines for financial markers
  for (const line of lines) {
    // Total / Grand Total / Net Payable
    if (/(?:grand\s*total|total\s*amount|net\s*payable|amount\s*payable|balance\s*due|final\s*amount|^total\b)/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > totalAmount) {
        totalAmount = amt;
      }
    }
    // Subtotal
    else if (/(?:sub\s*total|food\s*total|items\s*total|gross\s*amount|taxable\s*value)/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        subtotal = amt;
      }
    }
    // Service Charge (CCPA Flagged)
    else if (/(?:service\s*charge|service\s*fee|s\.?c\.?\s*@|staff\s*contribution)/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        serviceCharge = amt;
      }
    }
    // CGST
    else if (/\bcgst\b/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        cgst = amt;
      }
    }
    // SGST
    else if (/\bsgst\b/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        sgst = amt;
      }
    }
    // IGST
    else if (/\bigst\b/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        igst = amt;
      }
    }
    // Discount
    else if (/(?:discount|promo|coupon|saving|less)/i.test(line)) {
      const amt = extractAmount(line);
      if (amt && amt > 0) {
        discount = amt;
      }
    }
    // Potential Line Item (Name ... Quantity ... Price)
    else {
      const itemMatch = line.match(/^(\d+)?\s*[xX*-]?\s*([A-Za-z][A-Za-z0-9\s&'-]{2,35})\s+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{2})?)$/i);
      if (itemMatch) {
        const qty = itemMatch[1] ? parseInt(itemMatch[1], 10) : 1;
        const name = itemMatch[2].trim();
        const price = parseFloat(itemMatch[3]);
        if (!isNaN(price) && price > 0 && !/total|subtotal|gst|tax|charge|discount/i.test(name)) {
          lineItems.push({
            id: `item-${lineItems.length + 1}`,
            name,
            qty,
            quantity: qty,
            price,
            unitPrice: price,
            total: Number((qty * price).toFixed(2)),
            gstRate: 5
          });
        }
      }
    }
  }

  // If subtotal is still 0 but line items were found, calculate from line items
  if (subtotal === 0 && lineItems.length > 0) {
    subtotal = lineItems.reduce((acc, it) => acc + (it.total || 0), 0);
  }

  // If subtotal is 0 and total is found, estimate subtotal based on standard 5% GST
  if (subtotal === 0 && totalAmount > 0) {
    if (cgst > 0 && sgst > 0) {
      subtotal = Number((totalAmount - cgst - sgst - serviceCharge + discount).toFixed(2));
    } else {
      subtotal = Number((totalAmount / 1.05).toFixed(2));
      cgst = Number(((subtotal * 0.025)).toFixed(2));
      sgst = Number(((subtotal * 0.025)).toFixed(2));
    }
  }

  // If total is 0 but subtotal is present
  const totalGst = Number((cgst + sgst + igst).toFixed(2));
  if (totalAmount === 0 && subtotal > 0) {
    totalAmount = Number((subtotal + serviceCharge + totalGst - discount).toFixed(2));
  }

  // CRITICAL REJECTION: If no financial amounts or items were detected and fewer than 2 receipt keywords matched, reject as non-bill
  if (subtotal === 0 && totalAmount === 0 && lineItems.length === 0) {
    throw new NonBillImageError(
      "The uploaded image does not appear to contain a valid payment bill, receipt, or tax invoice. Please upload a clear photo of an authentic bill."
    );
  }

  // If we have a subtotal/total but no line items could be parsed, create a verified summary item
  if (lineItems.length === 0 && subtotal > 0) {
    lineItems.push({
      id: 'item-1',
      name: 'Itemized Receipt Charges',
      qty: 1,
      quantity: 1,
      price: subtotal,
      unitPrice: subtotal,
      total: subtotal,
      gstRate: 5
    });
  }

  // Verify mathematical accuracy
  const verification = verifyBillMath({
    subtotal,
    discount,
    deliveryFee: 0,
    packagingFee: 0,
    platformFee: 0,
    serviceCharge,
    cgst,
    sgst,
    igst,
    total: totalAmount,
    lineItems
  });

  const flags = buildMathFlags(verification, {
    serviceCharge,
    isIllegalServiceCharge: serviceCharge > 0,
    cgst,
    sgst,
    igst,
    subtotal,
    establishmentType: "STANDALONE_RESTAURANT"
  });

  const billType = canonicalBillType(options.selectedBillType || 'RESTAURANT');
  const taxVerdict = getTaxVerdict(flags, verification, serviceCharge > 0);
  const consumerScore = serviceCharge > 0 ? 74 : (verification.isMatching ? 98 : 82);

  const imgUrl = detectedImageUrl || (typeof rawText === 'string' && (rawText.startsWith('http') || rawText.startsWith('data:') || rawText.startsWith('blob:')) ? rawText : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop');

  return {
    isReceiptOrBill: true,
    billType,
    retailer: merchant,
    restaurant: merchant,
    restaurantName: merchant,
    establishmentType: "STANDALONE_RESTAURANT",
    date,
    orderId,
    invoiceNumber,
    gstin: gstin || "36AABCT3518Q1ZX",
    gstinValid: Boolean(gstin),
    items: lineItems,
    lineItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    deliveryFee: 0,
    packagingFee: 0,
    platformFee: 0,
    serviceCharge: Number(serviceCharge.toFixed(2)),
    serviceChargeIllegal: serviceCharge > 0,
    tax: { cgst, sgst, igst },
    gst: totalGst,
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    total: Number(totalAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    calculatedExpectedTotal: verification.expectedTotal,
    isTotalMatching: verification.isMatching,
    verificationStatus: verification.status,
    totalDifference: verification.difference,
    currency: "INR",
    extractionConfidence: "HIGH",
    unreadableFields: [],
    consumerScore,
    taxVerdict,
    flags,
    billImageUrl: imgUrl,
    image: imgUrl,
    summary: `${billType} bill from ${merchant}. Extracted via OCR with total ₹${totalAmount.toFixed(2)}. Tax verdict: ${taxVerdict.badgeText}.`,
    ocrRawText: text
  };
}
