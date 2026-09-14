import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import billRoutes from './routes/billRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: true, // Reflect request origin
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TaxShield Backend API',
    database: 'MongoDB',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/complaints', complaintRoutes);

// Serve Static Frontend Assets (Combined Frontend + Backend)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Fallback: Send index.html for all non-API GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.resolve(distPath, 'index.html'));
  }
  next();
});

// Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('[API Server Error]', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  TaxShield Express Server Running`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Database: MongoDB (Mongoose)`);
  console.log(`  Storage: Cloudinary`);
  console.log(`=========================================`);
});

export { app, server };
export default app;
