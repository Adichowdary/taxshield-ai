// Vercel Serverless Entry Point - wraps Express for serverless execution
import dotenv from "dotenv";
dotenv.config();

import { connectDB} from "../server/config/db.js";
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
    try {
      await connectDB();
      isConnected = true;
    } catch (e) {
      console.warn("[Vercel Serverless DB Warning]", e.message);
    }
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Health Check - supports both /api/health and /health
const healthHandler = async (req, res) => {
  await ensureDB();
  res.json({
    status: "ok",
    app: "TaxShield API (Vercel Serverless)",
    timestamp: new Date().toISOString(),
  });
};
	app.get("/api/health", healthHandler);
app.get("/health", healthHandler);
app.get("/api", healthHandler);
app.get("/", healthHandler);

// Database middleware
const dbMiddleware = async (req, res, next) => {
  await ensureDB();
  next();
};

// Mount Routes with and without /api prefix to handle all Vercel rewrite patterns
app.use("/api/auth", dbMiddleware, authRoutes);
app.use("/auth", dbMiddleware, authRoutes);

app.use("/api/bills", dbMiddleware, billRoutes);
app.use("/bills", dbMiddleware, billRoutes);
	app.use("/api/complaints", dbMiddleware, complaintRoutes);
app.use("/complaints", dbMiddleware, complaintRoutes);

// Error handler
app.use((err, req, res, _next) => {
  console.error("[Vercel API Error]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
