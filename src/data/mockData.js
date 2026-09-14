export const MOCK_BILLS = [
  {
    id: "bill-101",
    merchant: "The Grill House",
    category: "Restaurant",
    date: "2026-07-31",
    time: "20:45",
    invoiceNo: "TG-10482",
    address: "102 Connaught Place, New Delhi",
    gstin: "07AAAAA0000A1Z5",
    totalAmount: 1437.50,
    subtotal: 1250.00,
    taxes: 62.50,
    cgst: 31.25,
    sgst: 31.25,
    serviceCharge: 125.00,
    status: "REVIEW_RECOMMENDED",
    statusText: "Non-Mandatory Service Charge",
    confidenceScore: 87,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop",
    items: [
      { id: 1, name: "Paneer Tikka Platter", qty: 1, unitPrice: 320.00, taxRate: "5%", total: 320.00, confidence: 99, status: "VERIFIED" },
      { id: 2, name: "Butter Naan (2 pcs)", qty: 2, unitPrice: 90.00, taxRate: "5%", total: 180.00, confidence: 97, status: "VERIFIED" },
      { id: 3, name: "Special Veg Biryani", qty: 1, unitPrice: 450.00, taxRate: "5%", total: 450.00, confidence: 98, status: "VERIFIED" },
      { id: 4, name: "Fresh Lime Soda", qty: 2, unitPrice: 150.00, taxRate: "5%", total: 300.00, confidence: 94, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-102",
    merchant: "Urban Bistro & Cafe",
    category: "Cafe",
    date: "2026-07-28",
    time: "14:15",
    invoiceNo: "UB-88219",
    address: "Bandra West, Mumbai",
    gstin: "27BBBCC1111B1Z2",
    totalAmount: 892.50,
    subtotal: 850.00,
    taxes: 42.50,
    cgst: 21.25,
    sgst: 21.25,
    serviceCharge: 0.00,
    status: "VERIFIED",
    statusText: "100% Tax & Math Verified",
    confidenceScore: 98,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop",
    items: [
      { id: 1, name: "Iced Caramel Macchiato", qty: 2, unitPrice: 220.00, taxRate: "5%", total: 440.00, confidence: 99, status: "VERIFIED" },
      { id: 2, name: "Avocado Sourdough Toast", qty: 1, unitPrice: 410.00, taxRate: "5%", total: 410.00, confidence: 97, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-103",
    merchant: "Spice Route Fine Dining",
    category: "Fine Dining",
    date: "2026-07-20",
    time: "21:30",
    invoiceNo: "SR-40912",
    address: "MG Road, Bengaluru",
    gstin: "29DDDEE2222D1Z9",
    totalAmount: 3245.00,
    subtotal: 2750.00,
    taxes: 220.00,
    cgst: 110.00,
    sgst: 110.00,
    serviceCharge: 275.00,
    status: "POTENTIAL_OVERCHARGE",
    statusText: "Overcharged Tax Rate Flagged",
    confidenceScore: 82,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop",
    items: [
      { id: 1, name: "Chef's Tasting Menu", qty: 2, unitPrice: 1200.00, taxRate: "8%", total: 2400.00, confidence: 92, status: "WARNING" },
      { id: 2, name: "Artisanal Mocktail", qty: 2, unitPrice: 175.00, taxRate: "5%", total: 350.00, confidence: 95, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-104",
    merchant: "D-Mart Hypermarket",
    retailer: "D-Mart",
    billType: "GROCERY",
    category: "Grocery",
    platform: "Direct",
    date: "2026-08-05",
    time: "17:20",
    invoiceNo: "DM-2026-9012",
    address: "Kandivali West, Mumbai",
    gstin: "27AABCA3030A1Z1",
    totalAmount: 2480.00,
    subtotal: 2360.00,
    taxes: 120.00,
    cgst: 60.00,
    sgst: 60.00,
    serviceCharge: 0.00,
    status: "VERIFIED",
    statusText: "Tax Slabs 100% Compliant",
    confidenceScore: 99,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop",
    taxVerdict: {
      status: "CORRECT",
      badgeText: "Tax Verified Correct",
      badgeColor: "emerald",
      score: 98,
      effectiveGstPct: 5.1,
      totalTax: 120.00,
      overchargeAmount: 0,
      potentialSavings: 0,
      headline: "Multi-tier GST applied accurately across grocery essentials",
      summary: "0% applied on fresh staples, 5% on packaged oils, 18% on household cleaning items. No overcharge detected.",
      actionRecommended: "Receipt is compliant. Safe to store for budget tracking.",
      categoryLabel: "Supermarket & Groceries"
    },
    items: [
      { id: 1, name: "Aashirvaad Atta 10kg", qty: 1, unitPrice: 420.00, hsn: "1101", taxRate: "0%", total: 420.00, confidence: 99, status: "VERIFIED" },
      { id: 2, name: "Fortune Sunlite Oil 5L", qty: 1, unitPrice: 750.00, hsn: "1512", taxRate: "5%", total: 750.00, confidence: 98, status: "VERIFIED" },
      { id: 3, name: "Tata Salt 1kg", qty: 2, unitPrice: 28.00, hsn: "2501", taxRate: "0%", total: 56.00, confidence: 99, status: "VERIFIED" },
      { id: 4, name: "Ariel Matic Liquid Detergent 2L", qty: 1, unitPrice: 480.00, hsn: "3402", taxRate: "18%", total: 480.00, confidence: 97, status: "VERIFIED" },
      { id: 5, name: "Cadbury Celebrations Box", qty: 2, unitPrice: 190.00, hsn: "1806", taxRate: "18%", total: 380.00, confidence: 96, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-105",
    merchant: "Zudio - Trent Retail",
    retailer: "Zudio",
    billType: "FASHION",
    category: "Fashion",
    platform: "Direct",
    date: "2026-08-08",
    time: "19:10",
    invoiceNo: "ZUD-BLR-8812",
    address: "Koramangala 5th Block, Bengaluru",
    gstin: "29AAACT2727Q1ZT",
    totalAmount: 1888.00,
    subtotal: 1798.00,
    taxes: 90.00,
    cgst: 45.00,
    sgst: 45.00,
    serviceCharge: 0.00,
    status: "VERIFIED",
    statusText: "5% Apparel Rate Verified",
    confidenceScore: 96,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop",
    taxVerdict: {
      status: "CORRECT",
      badgeText: "Tax Verified Correct",
      badgeColor: "emerald",
      score: 97,
      effectiveGstPct: 5.0,
      totalTax: 90.00,
      overchargeAmount: 0,
      potentialSavings: 0,
      headline: "Statutory 5% GST bracket accurately applied",
      summary: "All purchased garments are priced under ₹1,000 and correctly billed at 5% GST rather than the higher 12% bracket.",
      actionRecommended: "Billed compliant with Notification No. 14/2021-CT(Rate).",
      categoryLabel: "Fashion & Lifestyle"
    },
    items: [
      { id: 1, name: "Men Cotton Chino Trouser", qty: 1, unitPrice: 799.00, hsn: "6203", taxRate: "5%", total: 799.00, confidence: 98, status: "VERIFIED" },
      { id: 2, name: "Oversized Graphic Tee", qty: 1, unitPrice: 499.00, hsn: "6109", taxRate: "5%", total: 499.00, confidence: 99, status: "VERIFIED" },
      { id: 3, name: "Casual Canvas Sneakers", qty: 1, unitPrice: 499.00, hsn: "6404", taxRate: "5%", total: 499.00, confidence: 95, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-106",
    merchant: "Croma Electronics",
    retailer: "Croma",
    billType: "ELECTRONICS",
    category: "Electronics",
    platform: "Direct",
    date: "2026-08-12",
    time: "15:45",
    invoiceNo: "CR-MUM-1142",
    address: "Phoenix Mall, Lower Parel, Mumbai",
    gstin: "27AAACI1920L1Z9",
    totalAmount: 4118.00,
    subtotal: 3490.00,
    taxes: 628.00,
    cgst: 314.00,
    sgst: 314.00,
    serviceCharge: 0.00,
    status: "VERIFIED",
    statusText: "18% Electronics GST Verified",
    confidenceScore: 98,
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop",
    taxVerdict: {
      status: "CORRECT",
      badgeText: "Tax Verified Correct",
      badgeColor: "emerald",
      score: 96,
      effectiveGstPct: 18.0,
      totalTax: 628.00,
      overchargeAmount: 0,
      potentialSavings: 0,
      headline: "18% GST matches electronics accessories classification",
      summary: "Peripherals and sound accessories are charged at the statutory 18% slab with HSN code validation.",
      actionRecommended: "Eligible for Business Input Tax Credit (ITC) if GSTIN is registered.",
      categoryLabel: "Electronics & Appliances"
    },
    items: [
      { id: 1, name: "Boat BassHeads 900 ANC", qty: 1, unitPrice: 2490.00, hsn: "8518", taxRate: "18%", total: 2490.00, confidence: 99, status: "VERIFIED" },
      { id: 2, name: "Fast Charging Power Bank 10000mAh", qty: 1, unitPrice: 1000.00, hsn: "8504", taxRate: "18%", total: 1000.00, confidence: 98, status: "VERIFIED" }
    ]
  },
  {
    id: "bill-107",
    merchant: "Apollo Pharmacy",
    retailer: "Apollo",
    billType: "PHARMACY",
    category: "Pharmacy",
    platform: "Direct",
    date: "2026-08-14",
    time: "11:20",
    invoiceNo: "AP-DEL-7781",
    address: "Lajpat Nagar, New Delhi",
    gstin: "07AAACA4502E1ZP",
    totalAmount: 683.20,
    subtotal: 610.00,
    taxes: 73.20,
    cgst: 36.60,
    sgst: 36.60,
    serviceCharge: 0.00,
    status: "VERIFIED",
    statusText: "12% Pharma GST Validated",
    confidenceScore: 97,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop",
    taxVerdict: {
      status: "CORRECT",
      badgeText: "Tax Verified Correct",
      badgeColor: "emerald",
      score: 95,
      effectiveGstPct: 12.0,
      totalTax: 73.20,
      overchargeAmount: 0,
      potentialSavings: 0,
      headline: "Medicines billed at designated formulation rate",
      summary: "All prescription medicines billed under Chapter 30 HSN tariff at 12% statutory rate.",
      actionRecommended: "Receipt verified. Retain for health insurance claim reimbursement.",
      categoryLabel: "Pharmacy & Healthcare"
    },
    items: [
      { id: 1, name: "Augmentin 625 Duo Tablets", qty: 1, unitPrice: 220.00, hsn: "3004", taxRate: "12%", total: 220.00, confidence: 99, status: "VERIFIED" },
      { id: 2, name: "Shelcal 500 Calcium Tablets", qty: 2, unitPrice: 140.00, hsn: "3004", taxRate: "12%", total: 280.00, confidence: 98, status: "VERIFIED" },
      { id: 3, name: "Betadine 10% Ointment 20g", qty: 1, unitPrice: 110.00, hsn: "3004", taxRate: "12%", total: 110.00, confidence: 96, status: "VERIFIED" }
    ]
  }
];

export const FAQ_ITEMS = [
  {
    question: "How does TaxShield analyze my shopping and restaurant bills?",
    answer: "TaxShield uses AI vision and OCR to extract line items, prices, HSN codes, and taxes. Our deterministic tax engine cross-checks rates against Indian GST tariff schedules for restaurants (5%/18%), supermarkets (0%/5%/12%/18%), apparel (5% for ≤₹1,000), electronics (18%), and pharmacy (5%/12%)."
  },
  {
    question: "What is the Tax Verdict card and how does it help me?",
    answer: "The Tax Verdict card is an AI-powered legal assessment that instantly answers: 'Was I overcharged?', 'Are these taxes statutory?', and 'Is this tax worth it?'. It shows your Tax Health Score, flags unlawful charges (like non-mandatory service charges or incorrect GST brackets), and details potential refunds."
  },
  {
    question: "What is the GST rate on clothing and shoes at stores like Zudio?",
    answer: "Under Indian GST law, apparel and footwear priced up to ₹1,000 per piece attract strictly 5% GST. Items exceeding ₹1,000 per piece attract 12% GST. TaxShield verifies individual item price thresholds so retailers don't charge 12% on budget clothing."
  },
  {
    question: "Is service charge mandatory in restaurants?",
    answer: "No. According to the Central Consumer Protection Authority (CCPA) in India, service charges levied by hotels and restaurants are voluntary. Customers have the right to ask for service charges to be removed before making payment."
  },
  {
    question: "Can I track my monthly spending across shopping categories?",
    answer: "Yes! The Smart Spending Dashboard categorizes your spending into Food & Dining, Supermarket & Groceries, Fashion, Electronics, and Pharmacy with real-time retailer breakdowns (D-Mart, Zudio, Swiggy, Croma)."
  }
];
