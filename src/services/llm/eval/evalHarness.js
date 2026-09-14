/**
 * TaxShield LLM Evaluation Harness — v2
 *
 * Changes from v1:
 *  - Configurable pass threshold (default 80%, strict 90%)
 *  - Added itemsCount field scoring
 *  - Colored terminal summary table output
 *  - Stricter gstin match (both null = pass)
 *  - Category breakdown in summary report
 */
import { TEST_BILLS } from "./testSet.js";
import { extractAndParseJson, normalizeBillData } from "../llmGateway.js";
import { analyzeWithGemini } from "../geminiAdapter.js";
import { analyzeWithClaude } from "../claudeAdapter.js";
import { analyzeWithNemotron } from "../nemotronAdapter.js";
import { analyzeWithCustomLlm } from "../customLlmAdapter.js";

// ANSI terminal colors (work in Node.js terminal output)
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
};

/**
 * Field accuracy comparator with numeric tolerance (±₹1.00)
 */
export function scoreFieldMatch(actual, expected, type = "text", tolerance = 1.0) {
  // Both null/empty = pass
  if ((expected === null || expected === undefined) && (actual === null || actual === undefined || actual === "" || actual === 0)) {
    return 1;
  }
  if (expected === null || expected === undefined) {
    if (type === "number") return Number(actual || 0) === 0 ? 1 : 0;
    return (!actual || actual === "null" || actual === "Not Found") ? 1 : 0;
  }

  if (type === "number") {
    const numActual   = Number(actual || 0);
    const numExpected = Number(expected || 0);
    return Math.abs(numActual - numExpected) <= tolerance ? 1 : 0;
  }

  if (type === "text") {
    const strActual   = String(actual || "").trim().toLowerCase();
    const strExpected = String(expected || "").trim().toLowerCase();
    return (strActual === strExpected || strActual.includes(strExpected) || strExpected.includes(strActual)) ? 1 : 0;
  }

  return actual === expected ? 1 : 0;
}

/**
 * Evaluate a single model adapter against a benchmark test case
 */
export async function evaluateTestCase(adapterFn, providerName, testCase, options = {}) {
  const startTime  = Date.now();
  let rawText      = "";
  let parseError   = null;
  let parsed       = null;
  let normalized   = null;

  try {
    const res = await adapterFn(testCase.billText, options);
    rawText    = res.rawText;
    parsed     = extractAndParseJson(rawText);
    normalized = normalizeBillData(parsed);
  } catch (err) {
    parseError = err.message;
  }

  const latencyMs  = Date.now() - startTime;
  const gt         = testCase.groundTruth;

  if (parseError || !normalized) {
    return {
      testId:           testCase.id,
      testName:         testCase.name,
      category:         testCase.category,
      provider:         providerName,
      latencyMs,
      passed:           false,
      overallScorePct:  0,
      parseError,
      fieldScores:      {}
    };
  }

  // Score individual key fields
  const actualItems = normalized.items || normalized.lineItems || [];
  const fieldScores = {
    platform:            scoreFieldMatch(normalized.platform,            gt.platform,            "text"),
    restaurant:          scoreFieldMatch(normalized.restaurantName,      gt.restaurant,          "text"),
    establishmentType:   scoreFieldMatch(normalized.establishmentType,   gt.establishmentType,   "text"),
    orderId:             scoreFieldMatch(normalized.orderId,             gt.orderId,             "text"),
    invoiceNumber:       scoreFieldMatch(normalized.invoiceNumber,       gt.invoiceNumber,       "text"),
    date:                scoreFieldMatch(normalized.date,               gt.date,                "text"),
    gstin:               scoreFieldMatch(normalized.gstin,              gt.gstin,               "text"),
    itemsCount:          gt.itemsCount != null
                           ? (actualItems.length === gt.itemsCount ? 1 : 0)
                           : 1,
    subtotal:            scoreFieldMatch(normalized.subtotal,            gt.subtotal,            "number"),
    discount:            scoreFieldMatch(normalized.discount,            gt.discount,            "number"),
    deliveryFee:         scoreFieldMatch(normalized.deliveryFee,         gt.deliveryFee,         "number"),
    packagingFee:        scoreFieldMatch(normalized.packagingFee,        gt.packagingFee,        "number"),
    platformFee:         scoreFieldMatch(normalized.platformFee,         gt.platformFee,         "number"),
    serviceCharge:       scoreFieldMatch(normalized.serviceCharge,       gt.serviceCharge,       "number"),
    cgst:                scoreFieldMatch(normalized.tax?.cgst,           gt.tax?.cgst,           "number"),
    sgst:                scoreFieldMatch(normalized.tax?.sgst,           gt.tax?.sgst,           "number"),
    total:               scoreFieldMatch(normalized.totalAmount,         gt.total,               "number"),
    extractionConfidence:scoreFieldMatch(normalized.extractionConfidence, gt.extractionConfidence, "text"),
  };

  const totalFields  = Object.keys(fieldScores).length;
  const passedFields = Object.values(fieldScores).reduce((a, b) => a + b, 0);
  const overallScorePct = Math.round((passedFields / totalFields) * 100);
  const threshold = options.strictMode ? 90 : (options.passThreshold || 80);

  return {
    testId:         testCase.id,
    testName:       testCase.name,
    category:       testCase.category,
    provider:       providerName,
    latencyMs,
    passed:         overallScorePct >= threshold,
    overallScorePct,
    passedFields,
    totalFields,
    fieldScores,
    extractedJSON:  normalized,
    rawText
  };
}

/**
 * Execute full evaluation harness for a specific model or all 4 models
 */
export async function runModelEvaluation(providers = ["gemini", "claude", "nemotron", "custom"], options = {}) {
  const testSuite    = options.testBills || TEST_BILLS;
  const summaryResults = [];

  const adapterMap = {
    gemini:   analyzeWithGemini,
    claude:   analyzeWithClaude,
    nemotron: analyzeWithNemotron,
    custom:   analyzeWithCustomLlm
  };

  const threshold = options.strictMode ? 90 : (options.passThreshold || 80);
  console.log(`${C.bold}${C.cyan}TaxShield LLM Evaluation Harness v2${C.reset}`);
  console.log(`${C.gray}Pass threshold: ${threshold}% | Test cases: ${testSuite.length} | Providers: ${providers.join(", ")}${C.reset}\n`);

  for (const providerKey of providers) {
    const adapterFn = adapterMap[providerKey];
    if (!adapterFn) {
      console.warn(`${C.yellow}Unknown provider: ${providerKey} — skipping${C.reset}`);
      continue;
    }

    console.log(`${C.bold}━━━ Testing: ${providerKey.toUpperCase()} ━━━${C.reset}`);

    const modelReport = {
      provider:       providerKey,
      totalTests:     testSuite.length,
      passedCount:    0,
      totalScoreSum:  0,
      avgScorePct:    0,
      avgLatencyMs:   0,
      fieldAccuracies:{},
      categoryScores: {},
      testResults:    []
    };

    let totalLatency = 0;

    for (const testCase of testSuite) {
      try {
        const result = await evaluateTestCase(adapterFn, providerKey, testCase, options);
        modelReport.testResults.push(result);

        const statusSymbol = result.passed
          ? `${C.green}✓${C.reset}`
          : `${C.red}✗${C.reset}`;
        const scoreColor = result.overallScorePct >= 90 ? C.green
          : result.overallScorePct >= 70 ? C.yellow : C.red;

        console.log(
          `  ${statusSymbol} ${testCase.name.slice(0, 48).padEnd(48)} ` +
          `${scoreColor}${result.overallScorePct}%${C.reset} ` +
          `${C.gray}(${result.latencyMs}ms)${C.reset}`
        );
        if (result.parseError) {
          console.log(`     ${C.red}Error: ${result.parseError.slice(0, 80)}${C.reset}`);
        }

        if (result.passed) modelReport.passedCount++;
        modelReport.totalScoreSum += result.overallScorePct;
        totalLatency += result.latencyMs;

        // Category breakdown
        const cat = testCase.category || "OTHER";
        if (!modelReport.categoryScores[cat]) {
          modelReport.categoryScores[cat] = { total: 0, sum: 0 };
        }
        modelReport.categoryScores[cat].total++;
        modelReport.categoryScores[cat].sum += result.overallScorePct;

        // Accumulate field accuracies
        if (result.fieldScores) {
          for (const [fName, score] of Object.entries(result.fieldScores)) {
            modelReport.fieldAccuracies[fName] = (modelReport.fieldAccuracies[fName] || 0) + score;
          }
        }
      } catch (err) {
        console.log(`  ${C.red}✗ ${testCase.name} — ERROR: ${err.message.slice(0, 60)}${C.reset}`);
        modelReport.testResults.push({
          testId:       testCase.id,
          testName:     testCase.name,
          provider:     providerKey,
          passed:       false,
          overallScorePct: 0,
          error:        err.message
        });
      }
    }

    modelReport.avgScorePct  = Math.round(modelReport.totalScoreSum / testSuite.length);
    modelReport.avgLatencyMs = Math.round(totalLatency / testSuite.length);

    // Convert field accuracies to percentage
    for (const fName of Object.keys(modelReport.fieldAccuracies)) {
      modelReport.fieldAccuracies[fName] = Math.round(
        (modelReport.fieldAccuracies[fName] / testSuite.length) * 100
      );
    }

    const passColor = modelReport.passedCount === testSuite.length ? C.green
      : modelReport.passedCount >= testSuite.length * 0.7 ? C.yellow : C.red;

    console.log(
      `\n  ${C.bold}Summary:${C.reset} ` +
      `${passColor}${modelReport.passedCount}/${testSuite.length} passed${C.reset}  ` +
      `Avg score: ${modelReport.avgScorePct}%  ` +
      `Avg latency: ${modelReport.avgLatencyMs}ms\n`
    );

    summaryResults.push(modelReport);
  }

  // Final comparison table
  if (summaryResults.length > 1) {
    console.log(`${C.bold}${C.cyan}━━━ PROVIDER COMPARISON ━━━${C.reset}`);
    console.log(`${"Provider".padEnd(12)} ${"Pass".padEnd(8)} ${"Avg Score".padEnd(12)} ${"Avg Latency"}`);
    console.log("─".repeat(48));
    for (const r of summaryResults) {
      const col = r.avgScorePct >= 85 ? C.green : r.avgScorePct >= 70 ? C.yellow : C.red;
      console.log(
        `${r.provider.padEnd(12)} ` +
        `${String(r.passedCount + "/" + r.totalTests).padEnd(8)} ` +
        `${col}${String(r.avgScorePct + "%").padEnd(12)}${C.reset}` +
        `${r.avgLatencyMs}ms`
      );
    }
    console.log("─".repeat(48));
  }

  return {
    timestamp:       new Date().toISOString(),
    totalTestCases:  testSuite.length,
    passThreshold:   threshold,
    reports:         summaryResults
  };
}
