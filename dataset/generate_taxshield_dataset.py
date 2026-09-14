"""
TaxShield synthetic dataset generator — v2 (10,000-Example Edition)
====================================================================

Produces train/validation/test JSONL files in the exact chat-format your
fine-tuning stack (Unsloth/TRL/PEFT) expects, matching the schema your
BILL_ANALYSIS_SYSTEM_PROMPT defines in prompts.js.

Improvements over v1:
  - Default count raised from 1,200 → 10,000
  - 40+ menu items across 8 cuisine categories
  - 20 restaurants with realistic establishment types
  - 10 weighted scenario types (vs 5 before)
  - Full 8-month date range (Jan–Aug 2026) with multiple Indian states
  - Platform-specific bill text templates (Swiggy, Zomato, Domino's, EatSure)
  - isReceiptOrBill: true / rejectionReason: null in every output
  - Realistic GSTIN codes per Indian state

Usage:
    python dataset/generate_taxshield_dataset.py --count 10000

Output:
    dataset/train.jsonl        (8,000 examples)
    dataset/validation.jsonl   (1,000 examples)
    dataset/test.jsonl         (1,000 examples)
"""
import argparse
import json
import random
import os

# ---------------------------------------------------------------------------
# System Prompt (mirrors prompts.js BILL_ANALYSIS_SYSTEM_PROMPT — keep in sync)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are TaxShield, a bill-extraction engine. Extract structured data from "
    "Indian restaurant/food-delivery invoices. Do NOT calculate or infer values "
    "that are not printed. If a field is absent, use null or 0. Never invent "
    "missing information. Return ONLY JSON matching the TaxShield schema."
)

# ---------------------------------------------------------------------------
# Data Tables
# ---------------------------------------------------------------------------
PLATFORMS = ["Swiggy", "Zomato", "Uber Eats", "EatSure", "Domino's", "Direct", "Direct", "Direct"]

# (name, establishment_type, star_rating)
RESTAURANTS = [
    ("Spice Garden Fine Dining",     "STANDALONE_RESTAURANT",    3),
    ("Punjabi Tadka",                "STANDALONE_RESTAURANT",    3),
    ("Golden Dragon Wok",            "STANDALONE_RESTAURANT",    3),
    ("Cafe Coastal",                 "STANDALONE_RESTAURANT",    3),
    ("Biryani House",                "STANDALONE_RESTAURANT",    3),
    ("Green Leaf Vegetarian",        "STANDALONE_RESTAURANT",    3),
    ("Truffles Burger Bistro",       "STANDALONE_RESTAURANT",    3),
    ("The Grill House",              "STANDALONE_RESTAURANT",    3),
    ("Momo Street Kitchen",          "STANDALONE_RESTAURANT",    3),
    ("South Spice Express",          "STANDALONE_RESTAURANT",    3),
    ("Barbeque Nation",              "STANDALONE_RESTAURANT",    4),
    ("Pizza Paradise",               "STANDALONE_RESTAURANT",    3),
    ("Chai Point Cafe",              "STANDALONE_RESTAURANT",    3),
    ("The Irish House",              "PUB_BAR",                  3),
    ("Social Pub & Kitchen",         "PUB_BAR",                  3),
    ("The Taj Palace Restaurant",    "LUXURY_HOTEL_RESTAURANT",  5),
    ("ITC Grand Chola Dining",       "LUXURY_HOTEL_RESTAURANT",  5),
    ("Leela Palace Fine Dine",       "LUXURY_HOTEL_RESTAURANT",  5),
    ("Radisson Blu Cafe",            "BUDGET_HOTEL_RESTAURANT",  3),
    ("Holiday Inn Express Kitchen",  "BUDGET_HOTEL_RESTAURANT",  3),
]

# (item_name, min_price, max_price, cuisine_tag)
ITEMS = [
    # North Indian
    ("Paneer Butter Masala",       260, 360, "north_indian"),
    ("Dal Makhani",                200, 300, "north_indian"),
    ("Chicken Biryani",            220, 380, "north_indian"),
    ("Mutton Rogan Josh",          380, 520, "north_indian"),
    ("Butter Naan",                 35,  65, "north_indian"),
    ("Tandoori Roti",               20,  40, "north_indian"),
    ("Paneer Tikka",               280, 380, "north_indian"),
    ("Chole Bhature",              130, 200, "north_indian"),
    # South Indian
    ("Masala Dosa",                100, 180, "south_indian"),
    ("Idli Sambar",                 80, 140, "south_indian"),
    ("Veg Uttapam",                110, 170, "south_indian"),
    ("Chicken Chettinad",          300, 420, "south_indian"),
    ("Hyderabadi Dum Biryani",     260, 380, "south_indian"),
    # Chinese / Pan-Asian
    ("Veg Fried Rice",             150, 220, "chinese"),
    ("Chicken Manchurian",         220, 320, "chinese"),
    ("Spring Rolls",               130, 200, "chinese"),
    ("Hakka Noodles",              160, 240, "chinese"),
    ("Crispy Chilli Paneer",       270, 360, "chinese"),
    # Fast Food / Continental
    ("Farmhouse Pizza (Medium)",   480, 620, "continental"),
    ("Grilled Chicken Burger",     200, 320, "continental"),
    ("French Fries (Large)",        90, 150, "continental"),
    ("Chicken Caesar Salad",       280, 400, "continental"),
    ("BBQ Chicken Wings",          320, 480, "continental"),
    # Desserts
    ("Gulab Jamun (2 pcs)",         60, 110, "dessert"),
    ("Chocolate Lava Cake",        150, 250, "dessert"),
    ("Mango Kulfi",                 90, 160, "dessert"),
    ("Tiramisu",                   220, 340, "dessert"),
    # Beverages (non-alcoholic)
    ("Cold Coffee",                 90, 160, "beverage"),
    ("Fresh Lime Soda",             60,  90, "beverage"),
    ("Mango Lassi",                 80, 130, "beverage"),
    ("Mineral Water",               30,  60, "beverage"),
    ("Masala Chai",                 40,  80, "beverage"),
    # Alcoholic (PUB_BAR — exempt from GST)
    ("Kingfisher Premium Beer",    200, 350, "alcohol"),
    ("Beer Pitcher (Draught)",     750, 950, "alcohol"),
    ("Whisky Peg (60ml)",          350, 550, "alcohol"),
    ("Vodka Shot",                 200, 350, "alcohol"),
    ("Red Wine (Glass)",           400, 650, "alcohol"),
    # Luxury / Fine Dining
    ("Chef Special Peking Duck",  2200,2800, "luxury"),
    ("Pan-Seared Salmon",         1200,1800, "luxury"),
    ("Wagyu Beef Tenderloin",     3200,4500, "luxury"),
    ("Jasmine Green Tea",          400, 600, "luxury"),
]

# Indian state → GSTIN prefix
STATE_GSTIN_PREFIX = {
    "Maharashtra":   "27",
    "Delhi":         "07",
    "Karnataka":     "29",
    "Tamil Nadu":    "33",
    "Telangana":     "36",
    "Gujarat":       "24",
    "Rajasthan":     "08",
    "West Bengal":   "19",
}
STATES = list(STATE_GSTIN_PREFIX.keys())

GSTIN_POOL = [
    "{prefix}AAAAA0000A1Z5", "{prefix}BBBBB1111B1Z2", "{prefix}CCCCC2222C1Z8",
    "{prefix}DDDDD3333D1Z4", "{prefix}EEEEE4444E1Z1", "{prefix}AAAPT0101Q1Z9",
    "{prefix}AABCU9603R1ZN", "{prefix}AABCP1122D1Z4", "{prefix}AAACR7711M1ZB",
]

GST_RATE_RESTAURANT = 0.05   # 5% (2.5% CGST + 2.5% SGST) for standalone
GST_RATE_LUXURY     = 0.18   # 18% (9% CGST + 9% SGST) for 5-star hotels


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def random_gstin(state=None):
    if state is None:
        state = random.choice(STATES)
    prefix = STATE_GSTIN_PREFIX[state]
    template = random.choice(GSTIN_POOL)
    return template.format(prefix=prefix)

def random_date():
    month = random.randint(1, 8)   # Jan–Aug 2026
    day   = random.randint(1, 28)
    return f"2026-{month:02d}-{day:02d}"

def make_items(n, establishment_type, restaurant_name):
    """Pick n diverse items appropriate for the establishment type."""
    is_pub = establishment_type == "PUB_BAR"
    is_luxury = establishment_type == "LUXURY_HOTEL_RESTAURANT"

    if is_pub:
        alcohol_items = [i for i in ITEMS if i[3] == "alcohol"]
        food_items    = [i for i in ITEMS if i[3] in ("north_indian", "chinese", "continental")]
        # At least 1 alcoholic item
        chosen = random.sample(alcohol_items, k=min(2, len(alcohol_items)))
        chosen += random.sample(food_items, k=max(1, n - len(chosen)))
    elif is_luxury:
        luxury_items  = [i for i in ITEMS if i[3] == "luxury"]
        beverage_items = [i for i in ITEMS if i[3] == "beverage"]
        chosen = random.sample(luxury_items, k=min(n, len(luxury_items)))
        if len(chosen) < n:
            chosen += random.sample(beverage_items, k=min(n - len(chosen), len(beverage_items)))
    else:
        non_alcohol = [i for i in ITEMS if i[3] != "alcohol" and i[3] != "luxury"]
        chosen = random.sample(non_alcohol, k=min(n, len(non_alcohol)))

    result = []
    for name, lo, hi, _ in chosen[:n]:
        qty        = random.choice([1, 1, 1, 2, 3])
        unit_price = round(random.uniform(lo, hi), 2)
        result.append({
            "name":      name,
            "quantity":  qty,
            "unitPrice": unit_price,
            "total":     round(qty * unit_price, 2),
        })
    return result


def make_order_id(platform):
    prefix_map = {
        "Swiggy":    "SWG",
        "Zomato":    "ZOM",
        "Uber Eats": "UBE",
        "EatSure":   "ETS",
        "Domino's":  "DOM",
    }
    prefix = prefix_map.get(platform, "ORD")
    return f"{prefix}-{random.randint(100000, 999999)}"


# ---------------------------------------------------------------------------
# Bill Builder
# ---------------------------------------------------------------------------
def build_bill(scenario):
    """
    scenario ∈ {
      clean, tax_discrepancy, missing_field, bad_ocr, illegal_service_charge,
      luxury_hotel, pub_bar_alcohol, discount_heavy, multi_item_large, delivery_only
    }
    """
    restaurant_info = random.choice(RESTAURANTS)
    rest_name, est_type, star_rating = restaurant_info

    # Scenario overrides
    if scenario == "luxury_hotel":
        candidates = [r for r in RESTAURANTS if r[1] == "LUXURY_HOTEL_RESTAURANT"]
        rest_name, est_type, star_rating = random.choice(candidates) if candidates else restaurant_info
    elif scenario == "pub_bar_alcohol":
        candidates = [r for r in RESTAURANTS if r[1] == "PUB_BAR"]
        rest_name, est_type, star_rating = random.choice(candidates) if candidates else restaurant_info

    n_items = random.randint(2, 5) if scenario != "multi_item_large" else random.randint(6, 10)
    if scenario == "delivery_only":
        n_items = random.randint(1, 3)

    items = make_items(n_items, est_type, rest_name)
    subtotal = round(sum(i["total"] for i in items), 2)

    is_luxury = est_type == "LUXURY_HOTEL_RESTAURANT"
    rate  = GST_RATE_LUXURY if is_luxury else GST_RATE_RESTAURANT
    cgst  = round(subtotal * rate / 2, 2)
    sgst  = round(subtotal * rate / 2, 2)

    # Platform
    is_delivery = scenario == "delivery_only"
    platform = random.choice(["Swiggy", "Zomato", "Uber Eats", "EatSure"]) if is_delivery else random.choice(PLATFORMS)
    is_dine_in = platform == "Direct"

    delivery_fee  = random.choice([0, 0, 30, 40, 49, 0]) if not is_dine_in else 0
    packaging_fee = random.choice([0, 0, 15, 20, 25]) if not is_dine_in else 0
    platform_fee  = random.choice([0, 5, 6, 9, 12]) if not is_dine_in else 0
    discount      = 0
    service_charge = 0
    unreadable    = []
    confidence    = "HIGH"

    # Discount
    if scenario in ("discount_heavy",):
        discount = round(subtotal * random.choice([0.2, 0.3, 0.4]), 2)
    else:
        discount = round(subtotal * random.choice([0, 0, 0, 0.1, 0.15]), 2)

    # Compute correct total
    correct_total = round(subtotal - discount + delivery_fee + packaging_fee + platform_fee + service_charge + cgst + sgst, 2)
    stated_total  = correct_total

    if scenario == "tax_discrepancy":
        delta = random.choice([-50, -35, -20, 20, 35, 50, 75])
        stated_total = round(correct_total + delta, 2)
    elif scenario == "missing_field":
        subtotal    = 0   # printed subtotal is illegible
        confidence  = "LOW"
        unreadable.append("subtotal")
    elif scenario == "bad_ocr":
        confidence  = "LOW"
        fields = ["cgst", "sgst", "restaurant name", "gstin", "date", "orderId"]
        unreadable.extend(random.sample(fields, k=random.randint(2, 3)))
    elif scenario == "illegal_service_charge":
        service_charge = round(subtotal * 0.10, 2)
        stated_total   = round(correct_total + service_charge, 2)

    # GSTIN
    state  = random.choice(STATES)
    gstin  = random_gstin(state) if random.random() > 0.15 else None
    date   = random_date()
    order_id = make_order_id(platform) if platform != "Direct" else None
    invoice_number = f"INV-2026-{random.randint(1000, 9999)}" if is_dine_in else None

    bill_json = {
        "isReceiptOrBill": True,
        "rejectionReason": None,
        "platform": platform,
        "restaurant": rest_name,
        "establishmentType": est_type,
        "orderId": order_id,
        "invoiceNumber": invoice_number,
        "date": date,
        "gstin": gstin,
        "items": items,
        "subtotal": subtotal,
        "discount": discount,
        "deliveryFee": delivery_fee,
        "packagingFee": packaging_fee,
        "platformFee": platform_fee,
        "serviceCharge": service_charge,
        "tax": {"cgst": cgst, "sgst": sgst, "igst": 0},
        "total": stated_total,
        "currency": "INR",
        "extractionConfidence": confidence,
        "unreadableFields": unreadable,
    }

    # Compute verification reference
    verified_expected = round(subtotal - discount + delivery_fee + packaging_fee + platform_fee + service_charge + cgst + sgst, 2)
    diff = round(stated_total - verified_expected, 2)
    if confidence == "LOW" or subtotal == 0:
        status = "unable_to_verify"
    elif abs(diff) <= 1.5:
        status = "verified"
    else:
        status = "discrepancy"

    verification = {
        "status": status,
        "expectedTotal": verified_expected,
        "statedTotal": stated_total,
        "difference": diff,
        "issues": (
            [] if status == "verified" else
            ["Illegal voluntary service charge detected"] if scenario == "illegal_service_charge" else
            [f"Stated total differs from expected by ₹{abs(diff)}"] if status == "discrepancy" else
            ["Insufficient/low-confidence data to verify"]
        ),
    }

    bill_text = render_bill_text(bill_json, platform, is_dine_in)
    return bill_text, bill_json, verification


# ---------------------------------------------------------------------------
# Realistic Bill Text Renderers (platform-specific formatting)
# ---------------------------------------------------------------------------
def render_bill_text(b, platform, is_dine_in):
    lines = []

    if platform == "Swiggy":
        lines.append(f"SWIGGY ORDER #{b['orderId']}")
        lines.append(f"Date: {b['date']}")
        lines.append(f"Restaurant: {b['restaurant']}")
    elif platform == "Zomato":
        lines.append(f"ZOMATO ORDER #{b['orderId']}")
        lines.append(f"Date: {b['date']}")
        lines.append(f"Restaurant: {b['restaurant']}")
    elif platform == "Uber Eats":
        lines.append(f"UBER EATS ORDER #{b['orderId']}")
        lines.append(f"Date: {b['date']}")
        lines.append(f"Partner Restaurant: {b['restaurant']}")
    elif platform == "EatSure":
        lines.append(f"EATSURE ORDER #{b['orderId']}")
        lines.append(f"Date: {b['date']}")
        lines.append(f"Restaurant: {b['restaurant']}")
    elif platform == "Domino's":
        lines.append(f"DOMINO'S PIZZA ORDER #{b['orderId']}")
        lines.append(f"Date: {b['date']}")
    else:
        # Direct / Dine-in
        lines.append(b["restaurant"].upper())
        if b["invoiceNumber"]:
            lines.append(f"Tax Invoice #: {b['invoiceNumber']}")
        lines.append(f"Date: {b['date']}")

    if b["gstin"]:
        lines.append(f"GSTIN: {b['gstin']}")

    lines.append("")
    for it in b["items"]:
        lines.append(f"{it['quantity']}x {it['name']} @ {it['unitPrice']:.2f} = {it['total']:.2f}")
    lines.append("")

    subtotal_label = "Item Total" if platform in ("Swiggy", "Zomato") else "Subtotal"
    lines.append(f"{subtotal_label}: {b['subtotal'] if b['subtotal'] else 'ILLEGIBLE'}")

    if b["discount"]:
        lines.append(f"{'Promo ' if platform == 'Zomato' else ''}Discount: -{b['discount']:.2f}")
    if b["deliveryFee"]:
        label = "Delivery Partner Fee" if platform == "Swiggy" else "Delivery Fee"
        lines.append(f"{label}: {b['deliveryFee']:.2f}")
    if b["packagingFee"]:
        label = "Restaurant Packaging" if platform == "Swiggy" else "Packaging Charges"
        lines.append(f"{label}: {b['packagingFee']:.2f}")
    if b["platformFee"]:
        lines.append(f"Platform Fee: {b['platformFee']:.2f}")
    if b["serviceCharge"]:
        lines.append(f"Voluntary Service Charge (10%): {b['serviceCharge']:.2f}")

    tax = b["tax"]
    if tax["cgst"] and tax["sgst"]:
        rate_label_c = "9" if b["establishmentType"] == "LUXURY_HOTEL_RESTAURANT" else "2.5"
        rate_label_s = rate_label_c
        lines.append(f"CGST @ {rate_label_c}%: {tax['cgst']:.2f}")
        lines.append(f"SGST @ {rate_label_s}%: {tax['sgst']:.2f}")
    elif tax["igst"]:
        lines.append(f"IGST: {tax['igst']:.2f}")

    total_label = "Bill Total" if platform == "Swiggy" else ("Grand Total" if platform == "Zomato" else "Total Payable")
    lines.append(f"{total_label}: {b['total']:.2f}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Example Builder
# ---------------------------------------------------------------------------
def make_example(scenario):
    bill_text, bill_json, verification = build_bill(scenario)
    return {
        "messages": [
            {"role": "system",    "content": SYSTEM_PROMPT},
            {"role": "user",      "content": f"Analyze this bill:\n{bill_text}"},
            {"role": "assistant", "content": json.dumps(bill_json, ensure_ascii=False)},
        ],
        # Kept alongside but not fed to the model — used for benchmark eval
        "_verification_reference": verification,
        "_scenario": scenario,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="TaxShield Dataset Generator v2")
    parser.add_argument("--count",  type=int, default=10000,  help="Total number of examples (default: 10,000)")
    parser.add_argument("--seed",   type=int, default=42,      help="Random seed")
    parser.add_argument("--outdir", type=str, default="dataset", help="Output directory (default: dataset/)")
    args = parser.parse_args()

    random.seed(args.seed)
    os.makedirs(args.outdir, exist_ok=True)

    # Weighted scenario distribution (out of 100 parts)
    scenario_weights = {
        "clean":                   40,
        "tax_discrepancy":         15,
        "missing_field":            8,
        "bad_ocr":                  7,
        "illegal_service_charge":   8,
        "luxury_hotel":             7,
        "pub_bar_alcohol":          5,
        "discount_heavy":           5,
        "multi_item_large":         3,
        "delivery_only":            2,
    }

    scenario_pool = []
    for sc, weight in scenario_weights.items():
        scenario_pool.extend([sc] * weight)

    print("=" * 60)
    print("  TAXSHIELD DATASET GENERATOR v2 — 10,000 EXAMPLE EDITION")
    print("=" * 60)
    print(f"  Total Examples : {args.count:,}")
    print(f"  Train Split    : {int(args.count * 0.8):,}")
    print(f"  Val Split      : {int(args.count * 0.1):,}")
    print(f"  Test Split     : {args.count - int(args.count * 0.8) - int(args.count * 0.1):,}")
    print(f"  Output Dir     : {args.outdir}/")
    print(f"  Scenarios      : {len(scenario_weights)} types")
    print(f"  Restaurants    : {len(RESTAURANTS)}")
    print(f"  Menu Items     : {len(ITEMS)}")
    print("=" * 60)
    print("\nGenerating examples...")

    examples = []
    for i in range(args.count):
        scenario = random.choice(scenario_pool)
        try:
            examples.append(make_example(scenario))
        except Exception as e:
            # Fallback to clean scenario if a rare edge case fails
            examples.append(make_example("clean"))
        if (i + 1) % 1000 == 0:
            print(f"  [{i+1:,}/{args.count:,}] generated...")

    random.shuffle(examples)

    n         = len(examples)
    train_end = int(n * 0.8)
    val_end   = int(n * 0.9)

    splits = {
        "train.jsonl":      examples[:train_end],
        "validation.jsonl": examples[train_end:val_end],
        "test.jsonl":       examples[val_end:],
    }

    print("\nWriting JSONL files...")
    for fname, rows in splits.items():
        fpath = os.path.join(args.outdir, fname)
        with open(fpath, "w", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        print(f"  [ok] Wrote {len(rows):,} examples -> {fpath}")

    # Scenario distribution report
    scenario_counts = {}
    for ex in examples:
        sc = ex.get("_scenario", "unknown")
        scenario_counts[sc] = scenario_counts.get(sc, 0) + 1

    print("\nScenario Distribution:")
    for sc, cnt in sorted(scenario_counts.items(), key=lambda x: -x[1]):
        pct = (cnt / n) * 100
        print(f"  {sc:<30} {cnt:>6,}  ({pct:5.1f}%)")

    print("\n[OK] Dataset generation complete!")
    print("Next step: Run fine-tuning with:")
    print("  python scripts/finetune_qlora.py --train_file dataset/train.jsonl --val_file dataset/validation.jsonl")


if __name__ == "__main__":
    main()

# ---------------------------------------------------------------------------
# Hardware requirements for fine-tuning:
#
#   6 GB VRAM  -> LLaMA-3.2-3B-Instruct (4-bit QLoRA)
#   8-12 GB    -> Qwen2.5-7B-Instruct or Mistral-7B (4-bit QLoRA)
#   16+ GB     -> 14B models at higher batch sizes
#
# See FINETUNING_GUIDE.md for full step-by-step instructions.
# ---------------------------------------------------------------------------
