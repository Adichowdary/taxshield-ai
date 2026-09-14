// Vercel Serverless Entry Point — wraps Express for serverless execution
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../server/config/db.js";
import express from "express";
import cors from "cors";
import authRoutes from "../server/routes/authRoutes.js";
import billRoutes from "../server/routes/billRoutes.js";
import complaintRoutes from "../server/routes/complaintRoutes.js";

const app = express();

// Connect MongoDB (cached between serverless invocations)
let isConnected = false;
async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Health Check
app.get("/api/health", async (req, res) => {
  await ensureDB();
  res.json({ status: "ok", app: "TaxShield API", timestamp: new Date().toISOString() });
});

// Routes — all wrapped with DB connection ensure
app.use("/api/auth", async (req, res, next) => { await ensureDB(); next(); }, authRoutes);
app.use("/api/bills", async (req, res, next) => { await ensureDB(); next(); }, billRoutes);
app.use("/api/complaints", async (req, res, next) => { await ensureDB(); next(); }, complaintRoutes);

// Error handler
app.use((err, req, res, _next) => {
  console.error("[Vercel API Error]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;

