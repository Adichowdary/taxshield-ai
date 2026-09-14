import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TEST_BILLS } from "../src/services/llm/eval/testSet.js";
import { runModelEvaluation } from "../src/services/llm/eval/evalHarness.js";

// Parse .env into process.env for Node CLI execution
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

async function main() {
  console.log("==================================================================");
  console.log("      TAXSHIELD AI - MULTI-MODEL LLM EVALUATION HARNESS          ");
  console.log("==================================================================");
  console.log(`Loaded Benchmark Dataset: ${TEST_BILLS.length} test cases\n`);

  // Target providers to run
  const providersArg = process.argv.slice(2);
  const providers = providersArg.length > 0 
    ? providersArg 
    : ["custom", "gemini", "claude", "nemotron"];

  console.log(`Target LLM Providers to Benchmark: [ ${providers.join(", ")} ]`);
  console.log("Executing evaluation suite...\n");

  const evalOptions = {
    apiKey: process.env.VITE_CUSTOM_LLM_API_KEY || "",
    endpoint: process.env.VITE_CUSTOM_LLM_ENDPOINT || "http://localhost:11434/v1"
  };

  try {
    const results = await runModelEvaluation(providers, evalOptions);

    // Print detailed individual test results
    for (const report of results.reports) {
      console.log(`\n==================================================================`);
      console.log(` DETAILED TEST BREAKDOWN FOR MODEL: [ ${report.provider.toUpperCase()} ]`);
      console.log(`==================================================================`);

      for (const tRes of report.testResults) {
        console.log(`\n------------------------------------------------------------------`);
        console.log(`TEST ID   : ${tRes.testId}`);
        console.log(`TEST NAME : ${tRes.testName}`);
        console.log(`LATENCY   : ${tRes.latencyMs} ms`);
        console.log(`STATUS    : ${tRes.passed ? "✅ PASSED" : "❌ FAILED"} (${tRes.overallScorePct}%)`);
        
        if (tRes.parseError || tRes.error) {
          console.log(`ERROR     : ${tRes.parseError || tRes.error}`);
          continue;
        }

        console.log(`\nFIELD ACCURACY COMPARISON:`);
        if (tRes.fieldScores) {
          for (const [field, score] of Object.entries(tRes.fieldScores)) {
            const icon = score === 1 ? "✓" : "✗";
            console.log(`  [${icon}] ${field.padEnd(22)} : ${score === 1 ? "MATCH" : "DIFF / MISMATCH"}`);
          }
        }

        console.log(`\nEXTRACTED JSON OUTPUT:`);
        console.log(JSON.stringify(tRes.extractedJSON, null, 2));
      }
    }

    console.log("\n==================================================================");
    console.log("                     EVALUATION SCORE SUMMARY                     ");
    console.log("==================================================================");

    for (const report of results.reports) {
      console.log(`\n------------------------------------------------------------------`);
      console.log(`PROVIDER: ${report.provider.toUpperCase()}`);
      console.log(`Passed Tests: ${report.passedCount} / ${report.totalTests}`);
      console.log(`Average Accuracy Score: ${report.avgScorePct}%`);
      console.log(`Average Latency: ${report.avgLatencyMs} ms`);
      console.log(`Field Accuracy Breakdown:`);
      
      for (const [field, accPct] of Object.entries(report.fieldAccuracies)) {
        const bar = "█".repeat(Math.round(accPct / 10)) + "░".repeat(10 - Math.round(accPct / 10));
        console.log(`  - ${field.padEnd(22)}: ${bar} ${accPct}%`);
      }
    }

    console.log("\n==================================================================");
    console.log("Evaluation complete. Freeze prompt if accuracy meets production bar!");
  } catch (err) {
    console.error("Evaluation script encountered an error:", err.message);
  }
}

main();
