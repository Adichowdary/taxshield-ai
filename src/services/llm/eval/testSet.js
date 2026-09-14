/**
 * Benchmark Test Set for TaxShield LLM Evaluation Harness — v2
 * Expanded from 6 → 12 test cases covering all key invoice scenarios.
 * Each entry has a hand-verified ground truth JSON.
 */

export const TEST_BILLS = [
  // -------------------------------------------------
  // CASE 01: Swiggy delivery — packaging + platform fee
  // -------------------------------------------------
  {
    id: "test_swiggy_01",
    name: "Swiggy Food Delivery with Platform & Packaging Fee",
    category: "FOOD_DELIVERY",
    billText: `SWIGGY ORDER #SWG-881923
Date: 2026-03-15
Restaurant: Punjab Grill Express
GSTIN: 07AABCU9603R1ZN
1x Dal Makhani @ 280.00 = 280.00
2x Garlic Naan @ 60.00 = 120.00
Subtotal: 400.00
Restaurant Packaging Fee: 30.00
Delivery Fee: 40.00
Platform Fee: 12.00
CGST (2.5%): 10.00
SGST (2.5%): 10.00
Total Amount: 492.00`,
    groundTruth: {
      platform: "Swiggy",
      restaurant: "Punjab Grill Express",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: "SWG-881923",
      invoiceNumber: null,
      date: "2026-03-15",
      gstin: "07AABCU9603R1ZN",
      itemsCount: 2,
      subtotal: 400.00,
      discount: 0,
      deliveryFee: 40.00,
      packagingFee: 30.00,
      platformFee: 12.00,
      serviceCharge: 0,
      tax: { cgst: 10.00, sgst: 10.00, igst: 0 },
      total: 492.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 02: Zomato delivery — discount + platform fee
  // -------------------------------------------------
  {
    id: "test_zomato_02",
    name: "Zomato Delivery with Discount & Platform Fee",
    category: "FOOD_DELIVERY",
    billText: `ZOMATO ORDER #ZOM-449102
Date: 2026-04-02
Restaurant: Pizza Express
GSTIN: 27AABCP1122D1Z4
1x Farmhouse Medium Pizza = 550.00
1x Garlic Breadsticks = 140.00
Subtotal: 690.00
Promo Discount: -100.00
Packaging Charges: 20.00
Delivery Fee: 25.00
Platform Fee: 9.00
CGST (2.5%): 14.75
SGST (2.5%): 14.75
Grand Total: 653.50`,
    groundTruth: {
      platform: "Zomato",
      restaurant: "Pizza Express",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: "ZOM-449102",
      invoiceNumber: null,
      date: "2026-04-02",
      gstin: "27AABCP1122D1Z4",
      itemsCount: 2,
      subtotal: 690.00,
      discount: 100.00,
      deliveryFee: 25.00,
      packagingFee: 20.00,
      platformFee: 9.00,
      serviceCharge: 0,
      tax: { cgst: 14.75, sgst: 14.75, igst: 0 },
      total: 653.50,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 03: Dine-in — illegal service charge
  // -------------------------------------------------
  {
    id: "test_dinein_service_charge_03",
    name: "Dine-In Restaurant with 10% Illegal Service Charge",
    category: "DINE_IN",
    billText: `OLIVE BISTRO & KITCHEN
Table: 12 | Tax Invoice #: INV-9901
Date: 2026-05-10
GSTIN: 36AAACR7711M1ZB
1x Chicken Alfredo Pasta = 520.00
1x Tiramisu Dessert = 280.00
Subtotal: 800.00
Voluntary Service Charge (10%): 80.00
CGST @ 2.5%: 20.00
SGST @ 2.5%: 20.00
Final Total: 920.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "OLIVE BISTRO & KITCHEN",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: null,
      invoiceNumber: "INV-9901",
      date: "2026-05-10",
      gstin: "36AAACR7711M1ZB",
      itemsCount: 2,
      subtotal: 800.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 80.00,
      tax: { cgst: 20.00, sgst: 20.00, igst: 0 },
      total: 920.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 04: 5-Star Luxury Hotel — 18% GST (legal)
  // -------------------------------------------------
  {
    id: "test_luxury_hotel_04",
    name: "5-Star Luxury Hotel Restaurant (18% GST)",
    category: "LUXURY_HOTEL",
    billText: `THE TAJ PALACE - ORIENTAL GRILL
Invoice No: TJ-2026-5541
Date: 2026-06-20
GSTIN: 07AAACT0101Q1Z9
1x Chef Special Peking Duck = 2400.00
1x Jasmine Green Tea = 400.00
Subtotal: 2800.00
CGST @ 9%: 252.00
SGST @ 9%: 252.00
Total Payable: 3304.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "THE TAJ PALACE - ORIENTAL GRILL",
      establishmentType: "LUXURY_HOTEL_RESTAURANT",
      orderId: null,
      invoiceNumber: "TJ-2026-5541",
      date: "2026-06-20",
      gstin: "07AAACT0101Q1Z9",
      itemsCount: 2,
      subtotal: 2800.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 252.00, sgst: 252.00, igst: 0 },
      total: 3304.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 05: Pub & Bar — alcohol + food, liquor VAT
  // -------------------------------------------------
  {
    id: "test_pub_bar_alcohol_05",
    name: "Pub & Bar Bill with Liquor VAT Exemption",
    category: "PUB_BAR",
    billText: `IRISH HOUSE PUB & BREWERY
Date: 2026-07-04
GSTIN: 27AABCI4433K1Z1
2x Draught Beer Pitcher @ 900 = 1800.00
1x Nachos Supreme = 420.00
Food Subtotal: 420.00
Liquor Subtotal: 1800.00
Food CGST (2.5%): 10.50
Food SGST (2.5%): 10.50
State Excise VAT (10%): 180.00
Total Amount: 2421.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "IRISH HOUSE PUB & BREWERY",
      establishmentType: "PUB_BAR",
      orderId: null,
      invoiceNumber: null,
      date: "2026-07-04",
      gstin: "27AABCI4433K1Z1",
      itemsCount: 2,
      subtotal: 2220.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 10.50, sgst: 10.50, igst: 0 },
      total: 2421.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 06: Blurry / partial — LOW extraction confidence
  // -------------------------------------------------
  {
    id: "test_blurry_partial_06",
    name: "Blurry / Cropped Bill with Unreadable Fields",
    category: "PARTIAL_BLURRY",
    billText: `CORNER BISTRO
Date: [BLURRED]
GSTIN: UNREADABLE
1x Veg Club Sandwich = 180.00
Subtotal: 180.00
Tax: [BLURRED]
Total: 189.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "CORNER BISTRO",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: null,
      invoiceNumber: null,
      date: null,
      gstin: null,
      itemsCount: 1,
      subtotal: 180.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      total: 189.00,
      currency: "INR",
      extractionConfidence: "LOW"
    }
  },

  // -------------------------------------------------
  // CASE 07: GST overcharge — standalone restaurant at 18%
  // -------------------------------------------------
  {
    id: "test_gst_overcharge_07",
    name: "GST Overcharge — Standalone Restaurant Charged 18%",
    category: "TAX_DISCREPANCY",
    billText: `SPICE ROUTE RESTAURANT
Date: 2026-02-14
GSTIN: 29AAACS8765F1Z3
1x Paneer Butter Masala = 320.00
2x Butter Naan @ 50.00 = 100.00
1x Veg Biryani = 280.00
Subtotal: 700.00
CGST @ 9%: 63.00
SGST @ 9%: 63.00
Total: 826.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "SPICE ROUTE RESTAURANT",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: null,
      invoiceNumber: null,
      date: "2026-02-14",
      gstin: "29AAACS8765F1Z3",
      itemsCount: 3,
      subtotal: 700.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 63.00, sgst: 63.00, igst: 0 },
      total: 826.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 08: Large multi-item dine-in order
  // -------------------------------------------------
  {
    id: "test_large_order_08",
    name: "Large Multi-Item Dine-In Order (6 items)",
    category: "DINE_IN",
    billText: `BARBEQUE NATION
Invoice #: BBQ-2026-8801
Date: 2026-07-20
GSTIN: 24AAABN5544C1Z7
2x Chicken Tikka @ 480.00 = 960.00
1x Mutton Seekh Kebab = 560.00
3x Butter Naan @ 55.00 = 165.00
2x Dal Makhani @ 280.00 = 560.00
1x Gulab Jamun = 120.00
1x Cold Coffee = 150.00
Subtotal: 2515.00
CGST @ 2.5%: 62.88
SGST @ 2.5%: 62.88
Total Payable: 2640.76`,
    groundTruth: {
      platform: "Direct",
      restaurant: "BARBEQUE NATION",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: null,
      invoiceNumber: "BBQ-2026-8801",
      date: "2026-07-20",
      gstin: "24AAABN5544C1Z7",
      itemsCount: 6,
      subtotal: 2515.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 62.88, sgst: 62.88, igst: 0 },
      total: 2640.76,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 09: Swiggy composite "Platform fee with GST" line
  // -------------------------------------------------
  {
    id: "test_swiggy_composite_fee_09",
    name: "Swiggy App Screenshot — Composite Platform Fee with GST",
    category: "FOOD_DELIVERY",
    billText: `ORDER #242663855077314
Egg Roll (2 Eggs) x 1 - 169.00
Item Total: 169.00
Restaurant Packaging: 10.00
Platform fee with GST: 17.58
Discount Applied: -70.00
Delivery Fee (FREE): 0
Taxes: 5.45
Bill Total: 132.00`,
    groundTruth: {
      platform: "Swiggy",
      restaurant: null,
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: "242663855077314",
      invoiceNumber: null,
      date: null,
      gstin: null,
      itemsCount: 1,
      subtotal: 169.00,
      discount: 70.00,
      deliveryFee: 0,
      packagingFee: 10.00,
      platformFee: 17.58,
      serviceCharge: 0,
      total: 132.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 10: EatSure / Budget hotel with no GSTIN
  // -------------------------------------------------
  {
    id: "test_eatsure_no_gstin_10",
    name: "EatSure Delivery — No GSTIN on Bill",
    category: "FOOD_DELIVERY",
    billText: `EATSURE ORDER #ETS-334521
Date: 2026-01-18
Restaurant: Radisson Blu Cafe
1x Club Sandwich = 380.00
1x Fresh Lime Juice = 80.00
Item Total: 460.00
Packaging: 20.00
Delivery Fee: 35.00
Platform Fee: 10.00
CGST (2.5%): 11.50
SGST (2.5%): 11.50
Total: 548.00`,
    groundTruth: {
      platform: "EatSure",
      restaurant: "Radisson Blu Cafe",
      establishmentType: "BUDGET_HOTEL_RESTAURANT",
      orderId: "ETS-334521",
      invoiceNumber: null,
      date: "2026-01-18",
      gstin: null,
      itemsCount: 2,
      subtotal: 460.00,
      discount: 0,
      deliveryFee: 35.00,
      packagingFee: 20.00,
      platformFee: 10.00,
      serviceCharge: 0,
      tax: { cgst: 11.50, sgst: 11.50, igst: 0 },
      total: 548.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 11: Math discrepancy — stated total differs
  // -------------------------------------------------
  {
    id: "test_math_discrepancy_11",
    name: "Bill with Math Discrepancy — Total Overcharged",
    category: "TAX_DISCREPANCY",
    billText: `THE GRILL HOUSE
Date: 2026-06-05
GSTIN: 33AAATG1234H1Z6
2x BBQ Chicken Wings @ 380.00 = 760.00
1x French Fries (Large) = 140.00
Subtotal: 900.00
CGST @ 2.5%: 22.50
SGST @ 2.5%: 22.50
Total: 1000.00`,
    groundTruth: {
      platform: "Direct",
      restaurant: "THE GRILL HOUSE",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: null,
      invoiceNumber: null,
      date: "2026-06-05",
      gstin: "33AAATG1234H1Z6",
      itemsCount: 2,
      subtotal: 900.00,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 22.50, sgst: 22.50, igst: 0 },
      total: 1000.00,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  },

  // -------------------------------------------------
  // CASE 12: Domino's delivery — missing invoice number
  // -------------------------------------------------
  {
    id: "test_dominos_12",
    name: "Domino's Pizza Online Delivery Order",
    category: "FOOD_DELIVERY",
    billText: `DOMINO'S PIZZA ORDER #DOM-778901
Date: 2026-08-11
Restaurant: Domino's Pizza
GSTIN: 08AABCD5678K1Z2
1x Farmhouse Medium Pizza = 499.00
1x Garlic Breadsticks = 149.00
Item Total: 648.00
Delivery Charges: 40.00
CGST (2.5%): 16.20
SGST (2.5%): 16.20
Total Amount: 720.40`,
    groundTruth: {
      platform: "Domino's",
      restaurant: "Domino's Pizza",
      establishmentType: "STANDALONE_RESTAURANT",
      orderId: "DOM-778901",
      invoiceNumber: null,
      date: "2026-08-11",
      gstin: "08AABCD5678K1Z2",
      itemsCount: 2,
      subtotal: 648.00,
      discount: 0,
      deliveryFee: 40.00,
      packagingFee: 0,
      platformFee: 0,
      serviceCharge: 0,
      tax: { cgst: 16.20, sgst: 16.20, igst: 0 },
      total: 720.40,
      currency: "INR",
      extractionConfidence: "HIGH"
    }
  }
];
