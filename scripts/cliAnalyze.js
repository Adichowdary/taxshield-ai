import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeBill } from "../src/services/llm/llmGateway.js";
import { checkCustomLlmHealth } from "../src/services/llm/customLlmAdapter.js";

// Load .env variables into process.env
function loadEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || "").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

loadEnv();

const EXAMPLES = [
  {
    id: 1,
    title: "Swiggy Delivery — Platform Fee & Packaging Audit",
    text: `SWIGGY ORDER #SWG-881923
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
Total Amount: 492.00`
  },
  {
    id: 2,
    title: "Zomato Delivery — Promo Discount & Composite Fee",
    text: `ZOMATO ORDER #ZOM-449102
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
Grand Total: 653.50`
  },
  {
    id: 3,
    title: "Dine-In Restaurant — Illegal 10% Service Charge (CCPA Violation)",
    text: `OLIVE BISTRO & KITCHEN
Table: 14 | Bill #: OB-8921
Date: 2026-05-10
GSTIN: 29AAACK4321F1ZT
2x Woodfired Pasta @ 420.00 = 840.00
1x Tiramisu @ 310.00 = 310.00
2x Iced Tea @ 120.00 = 240.00
Subtotal: 1390.00
Service Charge (10%): 139.00
CGST (2.5%): 34.75
SGST (2.5%): 34.75
Total Payable: 1598.50`
  },
  {
    id: 4,
    title: "5-Star Luxury Hotel Dining — Legal 18% GST Bracket",
    text: `THE TAJ MAHAL PALACE — SHAMIANA
Declared Tariff: ₹12,000/night
Date: 2026-07-20
GSTIN: 27AAACT0001A1Z9
1x Buffet Dinner @ 3500.00 = 3500.00
1x Sparkling Water @ 450.00 = 450.00
Subtotal: 3950.00
CGST (9.0%): 355.50
SGST (9.0%): 355.50
Total: 4661.00`
  },
  {
    id: 5,
    title: "Tax Math Discrepancy — Overcharged GST Calculation",
    text: `SPICE BOWL RESTAURANT
Invoice #: SB-1049
Date: 2026-08-12
GSTIN: 36AAACB1234F1Z8
1x Butter Chicken: ₹380.00
2x Roti: ₹60.00
Subtotal: ₹440.00
CGST (5%): ₹22.00
SGST (5%): ₹22.00
Total Stated: ₹520.00`
  },
  {
    id: 6,
    title: "Non-Bill Document / Food Photo Rejection",
    text: `[IMAGE: Photo of cheese pizza slice with toppings, no text or receipt details printed]`
  }
];

async function main() {
  console.log("\n==================================================================");
  console.log("             🛡️  TAXSHIELD AI - COMMAND LINE INTERFACE             ");
  console.log("==================================================================");

  const model = process.env.VITE_CUSTOM_LLM_MODEL || "taxshield-1b";
  const endpoint = process.env.VITE_CUSTOM_LLM_ENDPOINT || "http://localhost:11434/v1";

  console.log(`📍 Endpoint : ${endpoint}`);
  console.log(`🧠 AI Model : ${model}`);
  console.log("🔍 Checking local Ollama connection...");

  const health = await checkCustomLlmHealth(endpoint);
  if (!health.online) {
    console.log("\n❌ [ERROR] Could not connect to Ollama!");
    console.log("👉 Please open a separate CMD window and start Ollama:");
    console.log(`   ollama run ${model}\n`);
    process.exit(1);
  }

  console.log(`✅ Connected to Ollama! Models detected: ${health.models.join(", ") || model}\n`);

  // Check if bill argument or example ID was passed
  const args = process.argv.slice(2);
  let billText = "";
  let selectedExample = null;

  if (args.length > 0) {
    const inputArg = args[0].trim();
    const exampleId = parseInt(inputArg, 10);

    if (!isNaN(exampleId) && exampleId >= 1 && exampleId <= EXAMPLES.length) {
      selectedExample = EXAMPLES[exampleId - 1];
      billText = selectedExample.text;
      console.log(`📌 Selected Preset: [Example ${selectedExample.id}] ${selectedExample.title}\n`);
    } else {
      const fullInput = args.join(" ");
      if (fs.existsSync(fullInput)) {
        console.log(`📄 Reading bill text from file: ${fullInput}\n`);
        billText = fs.readFileSync(fullInput, "utf-8");
      } else {
        billText = fullInput;
      }
    }
  } else {
    console.log("💡 AVAILABLE PRESET EXAMPLES (Run with: npm run ai <1-6>):");
    EXAMPLES.forEach(ex => {
      console.log(`   ${ex.id}. ${ex.title}`);
    });
    console.log(`\n⚡ No argument passed — running [Example 1: ${EXAMPLES[0].title}] by default.\n`);
    selectedExample = EXAMPLES[0];
    billText = selectedExample.text;
  }

  console.log("----------------------- BILL INPUT -----------------------");
  console.log(billText.trim());
  console.log("----------------------------------------------------------\n");

  console.log(`🤖 Analyzing bill with TaxShield AI (${model})... Please wait.`);

  try {
    const result = await analyzeBill(billText, { provider: "custom", model });

    console.log("\n=================== 📊 AUDIT RESULTS ===================");
    console.log(`🏪 Restaurant     : ${result.restaurant || "Unknown"}`);
    console.log(`📦 Platform       : ${result.platform}`);
    console.log(`🏢 Category       : ${result.establishmentType}`);
    console.log(`🆔 GSTIN          : ${result.gstin || "Not Found"} (Valid: ${result.gstinValid ? "YES ✅" : "NO ⚠️"})`);
    console.log(`📅 Date           : ${result.date || "N/A"}`);
    console.log("--------------------------------------------------------");
    console.log(`💰 Subtotal       : ₹${result.subtotal}`);
    console.log(`🛵 Platform Fee   : ₹${result.platformFee}`);
    console.log(`📦 Packaging Fee  : ₹${result.packagingFee}`);
    console.log(`🏛️ CGST / SGST    : ₹${result.cgst} / ₹${result.sgst} (Total GST: ₹${result.gst})`);
    console.log(`⚠️ Service Charge : ₹${result.serviceCharge} ${result.serviceChargeIllegal ? "(ILLEGAL PER CCPA 🚨)" : ""}`);
    console.log(`💵 Stated Total   : ₹${result.total}`);
    console.log(`🔢 Expected Total : ₹${result.calculatedExpectedTotal}`);
    console.log(`⚖️ Math Status    : ${result.verificationStatus.toUpperCase()} (${result.isTotalMatching ? "MATCH ✅" : "DISCREPANCY ❌ Diff: ₹" + result.totalDifference})`);
    console.log(`🛡️ Consumer Score : ${result.consumerScore}/100`);
    console.log("--------------------------------------------------------");

    if (result.flags && result.flags.length > 0) {
      console.log("🚨 FLAGS DETECTED:");
      result.flags.forEach((f, idx) => {
        console.log(`  ${idx + 1}. [${f.type}] ${f.title}`);
        console.log(`     -> ${f.description}`);
      });
    } else {
      console.log("✅ No tax or compliance flags detected. Clean bill!");
    }

    console.log("========================================================\n");
  } catch (err) {
    console.error("\n❌ Analysis failed:", err.message);
  }
}

main();
