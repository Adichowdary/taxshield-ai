/**
 * OPTIONAL DATA MIGRATION SCRIPT: Firestore -> MongoDB
 * 
 * IMPORTANT:
 * - This script is strictly MANUAL. It is NOT executed automatically.
 * - To run this script manually:
 *     node server/scripts/migrateFromFirestore.js
 * 
 * Requirements:
 * 1. Reads existing documents from Firestore collection ("bills").
 * 2. Converts them to MongoDB Bill models.
 * 3. Preserves all Cloudinary URLs and images.
 * 4. Inserts data into MongoDB Atlas / local MongoDB.
 * 5. DOES NOT delete or modify any existing Firestore data.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import Bill from '../models/Bill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  console.log('--- TaxShield Firestore to MongoDB Data Migration ---');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI is not defined in .env file.');
    process.exit(1);
  }

  // 1. Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  // 2. Initialize Firebase Admin if serviceAccountKey or default credentials exist
  let firestoreDb;
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'taxshield-87bf9',
      });
    }
    firestoreDb = admin.firestore();
    console.log('Connected to Firestore.');
  } catch (err) {
    console.warn('Note: Firebase Admin initialization warning:', err.message);
    console.log('If you have a service account JSON, set GOOGLE_APPLICATION_CREDENTIALS path.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // 3. Migrate Bills
  try {
    console.log('Fetching bills from Firestore "bills" collection...');
    const snapshot = await firestoreDb.collection('bills').get();

    if (snapshot.empty) {
      console.log('No documents found in Firestore "bills" collection.');
    } else {
      console.log(`Found ${snapshot.size} bills in Firestore. Migrating to MongoDB...`);
      let migratedCount = 0;
      let skippedCount = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Preserve Cloudinary URL
        const billImageUrl = data.billImageUrl || data.imageUrl || data.image || '';

        // Check if already migrated by comparing invoiceNo or custom id
        const existing = await Bill.findOne({
          $or: [
            { invoiceNo: data.invoiceNo || '___none___' },
            { billImageUrl: billImageUrl || '___none___' },
          ],
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await Bill.create({
          userId: data.userId || 'guest',
          restaurantName: data.restaurantName || data.merchant || 'Establishment',
          billNumber: data.billNumber || data.invoiceNo || '',
          invoiceNo: data.invoiceNo || '',
          billDate: data.createdAt?.toDate ? data.createdAt.toDate() : (data.date ? new Date(data.date) : new Date()),
          date: data.date || '',
          time: data.time || '',
          totalAmount: Number(data.totalAmount || data.total || 0),
          total: Number(data.totalAmount || data.total || 0),
          subtotal: Number(data.subtotal || 0),
          gstAmount: Number(data.gstAmount || data.taxes || data.gst || 0),
          taxes: Number(data.gstAmount || data.taxes || data.gst || 0),
          serviceCharge: Number(data.serviceCharge || 0),
          otherCharges: Number(data.otherCharges || 0),
          discount: Number(data.discount || 0),
          category: data.category || data.establishmentType || 'Restaurant',
          establishmentType: data.establishmentType || data.category || 'Restaurant',
          platform: data.platform || 'Direct',
          gstin: data.gstin || '',
          address: data.address || '',
          billImageUrl: billImageUrl,
          image: billImageUrl,
          cloudinaryPublicId: data.cloudinaryPublicId || '',
          extractedText: data.extractedText || '',
          billScore: Number(data.billScore || data.confidenceScore || 100),
          confidenceScore: Number(data.confidenceScore || data.billScore || 100),
          verificationStatus: data.verificationStatus || data.status || 'Uploaded',
          items: data.items || data.lineItems || [],
          lineItems: data.items || data.lineItems || [],
          issues: data.issues || [],
          verification: data.verification || {},
          analysisResult: data.analysisResult || {},
        });

        migratedCount++;
      }

      console.log(`Migration Complete: ${migratedCount} migrated, ${skippedCount} skipped (already exists).`);
    }
  } catch (err) {
    console.error('Error migrating documents:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Firestore data was NOT deleted.');
  }
}

// Only execute when run directly from the command line
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}

export default runMigration;
