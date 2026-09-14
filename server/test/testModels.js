import assert from 'assert';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
import Complaint from '../models/Complaint.js';

async function runModelTests() {
  console.log('Testing Mongoose Schemas and Models (Offline Validation)...');

  // Test 1: User Model Validation & Methods
  console.log('1. Testing User Model...');
  const user = new User({
    name: 'Test Consumer',
    email: 'test@taxshield.ai',
  });
  
  // Test password hashing
  const hash = await User.hashPassword('SecretPass123!');
  user.passwordHash = hash;
  assert.strictEqual(await user.matchPassword('SecretPass123!'), true, 'Password match should succeed');
  assert.strictEqual(await user.matchPassword('WrongPass'), false, 'Wrong password should fail');

  const userJson = user.toJSON();
  assert.strictEqual(userJson.passwordHash, undefined, 'passwordHash must never be exposed in toJSON()');
  assert.strictEqual(userJson.email, 'test@taxshield.ai');
  console.log('   User Model tests passed.');

  // Test 2: Bill Model Validation & Defaults
  console.log('2. Testing Bill Model...');
  const bill = new Bill({
    userId: 'user_12345',
    restaurantName: 'The Grill House',
    billImageUrl: 'https://res.cloudinary.com/ujdskwps/image/upload/v1/taxshield/bill1.jpg',
    cloudinaryPublicId: 'taxshield/bill1',
    totalAmount: 1437.50,
    serviceCharge: 125.00,
    verificationStatus: 'REVIEW_RECOMMENDED',
    items: [
      { name: 'Paneer Tikka', qty: 1, unitPrice: 320, total: 320, status: 'VERIFIED' }
    ]
  });

  let billValidationError;
  try {
    await bill.validate();
  } catch (err) {
    billValidationError = err;
  }
  assert.strictEqual(billValidationError, undefined, 'Valid bill should have no validation errors');
  assert.strictEqual(bill.billImageUrl, 'https://res.cloudinary.com/ujdskwps/image/upload/v1/taxshield/bill1.jpg');
  assert.strictEqual(bill.cloudinaryPublicId, 'taxshield/bill1');
  assert.strictEqual(bill.items.length, 1);
  assert.strictEqual(bill.items[0].name, 'Paneer Tikka');
  console.log('   Bill Model tests passed.');

  // Test 3: Complaint Model Validation & Allowed Statuses
  console.log('3. Testing Complaint Model...');
  const complaint = new Complaint({
    userId: 'user_12345',
    restaurantName: 'The Grill House',
    complaintReason: 'SERVICE_CHARGE',
    complaintDetails: 'Formal CCPA notice regarding mandatory service charge',
    status: 'Generated'
  });

  let complaintError;
  try {
    await complaint.validate();
  } catch (err) {
    complaintError = err;
  }
  assert.strictEqual(complaintError, undefined, 'Valid complaint should have no validation errors');
  assert.strictEqual(complaint.status, 'Generated');

  // Test invalid status
  const invalidComplaint = new Complaint({
    userId: 'user_12345',
    restaurantName: 'The Grill House',
    complaintReason: 'SERVICE_CHARGE',
    complaintDetails: 'Notice',
    status: 'InvalidStatus'
  });
  let invalidError;
  try {
    await invalidComplaint.validate();
  } catch (err) {
    invalidError = err;
  }
  assert.ok(invalidError, 'Invalid status enum should trigger validation error');
  console.log('   Complaint Model tests passed.');

  console.log('\nAll offline model and schema validations PASSED successfully!');
  process.exit(0);
}

runModelTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

