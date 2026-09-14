import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 DNS resolution — fixes EBADRESP on Windows with Atlas SRV records
dns.setDefaultResultOrder('ipv4first');

// Prevent Mongoose from buffering queries when MongoDB connection is unavailable
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxshield';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4
    });
    console.log(`[MongoDB] ✅ Connected to: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.warn(`[MongoDB Warning] Please ensure MONGODB_URI is properly set in your .env file.`);
    return null;
  }
};
