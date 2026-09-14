import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.VITE_FIREBASE_API_KEY;
console.log("Testing Firebase API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");

async function checkFirebase() {
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        continueUri: "https://taxshield-87bf9.firebaseapp.com",
        providerId: "google.com"
      })
    });
    const data = await res.json();
    if (data.error) {
      console.log("Firebase Auth Status: ERROR ->", data.error.message);
      return false;
    } else {
      console.log("Firebase Auth Status: OK! Provider:", data.providerId);
      return true;
    }
  } catch (err) {
    console.error("Firebase connection error:", err.message);
    return false;
  }
}

async function checkGemini() {
  const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  console.log("\nTesting Gemini API Key:", geminiKey ? (geminiKey.includes("your_gemini_api_key") ? "PLACEHOLDER ('" + geminiKey + "')" : `${geminiKey.substring(0, 8)}...`) : "NOT SET");
  
  if (!geminiKey || geminiKey.includes("your_gemini_api_key")) {
    console.log("Gemini API Status: NOT CONFIGURED (Default placeholder in .env)");
    return false;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    const data = await res.json();
    if (data.error) {
      console.log("Gemini API Status: INVALID KEY ->", data.error.message);
      return false;
    } else {
      console.log("Gemini API Status: OK! Models available:", data.models?.length || 0);
      return true;
    }
  } catch (err) {
    console.error("Gemini API connection error:", err.message);
    return false;
  }
}

async function main() {
  console.log("=== TaxShield Service Health Check ===");
  await checkFirebase();
  await checkGemini();
  console.log("======================================");
}

main();
