/**
 * Master Backend Test Suite for TaxShield API
 * Comprehensive testing of all endpoints, validation, security, CRUD, and edge cases.
 */
import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

class MasterTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.authToken = null;
    this.testUserId = null;
    this.createdBillId = null;
    this.createdComplaintId = null;
    this.testEmail = `tester_${Date.now()}@taxshield.ai`;
  }

  async run(name, fn) {
    process.stdout.write(`  ▶ ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      this.passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      this.failed++;
    }
  }

  async req(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, headers: res.headers, data };
  }
}

async function runMasterTestSuite() {
  console.log('\n=================================================================');
  console.log('       🛡️  TAXSHIELD MASTER BACKEND TEST SUITE EXECUTION  🛡️');
  console.log('=================================================================\n');

  const t = new MasterTester();

  // -------------------------------------------------------------
  // SUITE 1: HEALTH & ENVIRONMENT DIAGNOSTICS
  // -------------------------------------------------------------
  console.log('📦 SUITE 1: Health & Environmental Diagnostics');

  await t.run('GET /api/health returns 200 with OK status and metadata', async () => {
    const res = await t.req('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.app, 'TaxShield Backend API');
    assert.ok(res.data.timestamp);
  });

  await t.run('GET /api/bills/llm-health returns Ollama status information', async () => {
    const res = await t.req('/api/bills/llm-health');
    assert.strictEqual(res.status, 200);
    assert.ok('online' in res.data, 'Response should declare online boolean');
    assert.ok('model' in res.data, 'Response should declare model identifier');
  });

  // -------------------------------------------------------------
  // SUITE 2: AUTHENTICATION & SECURITY CONTROLS
  // -------------------------------------------------------------
  console.log('\n📦 SUITE 2: Authentication & Access Control');

  await t.run('POST /api/auth/register rejects missing fields with 400', async () => {
    const res = await t.req('/api/auth/register', {
      method: 'POST',
      body: { email: 'bad@test.com' } // Missing password and name
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/auth/register rejects password under 6 characters with 400', async () => {
    const res = await t.req('/api/auth/register', {
      method: 'POST',
      body: { name: 'Short Pw', email: 'short@test.com', password: '123' }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/auth/register creates user and generates JWT token', async () => {
    const res = await t.req('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Master Tester',
        email: t.testEmail,
        password: 'Password123!',
        role: 'user'
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token, 'Response must include JWT token');
    assert.strictEqual(res.data.user.email, t.testEmail);
    assert.strictEqual(res.data.user.passwordHash, undefined, 'passwordHash must NEVER be exposed');
    t.authToken = res.data.token;
    t.testUserId = res.data.user.id || res.data.user._id;
  });

  await t.run('POST /api/auth/register rejects duplicate email with 400', async () => {
    const res = await t.req('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Tester',
        email: t.testEmail,
        password: 'Password123!'
      }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/auth/login rejects wrong password with 401', async () => {
    const res = await t.req('/api/auth/login', {
      method: 'POST',
      body: { email: t.testEmail, password: 'WrongPassword999' }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await t.req('/api/auth/login', {
      method: 'POST',
      body: { email: t.testEmail, password: 'Password123!' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token);
    t.authToken = res.data.token;
  });

  await t.run('GET /api/auth/me returns authenticated user profile with Bearer token', async () => {
    const res = await t.req('/api/auth/me');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.email, t.testEmail);
  });

  await t.run('GET /api/auth/me rejects invalid / tampered token with 401', async () => {
    const res = await t.req('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid.token.payload' }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // -------------------------------------------------------------
  // SUITE 3: BILL MANAGEMENT & RECEIPT INGESTION (CRUD)
  // -------------------------------------------------------------
  console.log('\n📦 SUITE 3: Receipt / Bill Intelligence CRUD & Analytics');

  await t.run('POST /api/bills rejects missing restaurant/retailer name with 400', async () => {
    const res = await t.req('/api/bills', {
      method: 'POST',
      body: { totalAmount: 500 }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/bills successfully creates a multi-category receipt', async () => {
    const billPayload = {
      restaurantName: 'The Imperial Spice Bistro',
      retailer: 'The Imperial Spice Bistro',
      billType: 'RESTAURANT',
      category: 'Dining',
      establishmentType: 'Restaurant',
      invoiceNo: `INV-TEST-${Date.now()}`,
      date: '2026-08-15',
      subtotal: 1200.00,
      cgst: 30.00,
      sgst: 30.00,
      taxes: 60.00,
      serviceCharge: 120.00,
      totalAmount: 1380.00,
      verificationStatus: 'REVIEW_RECOMMENDED',
      items: [
        { name: 'Kadhai Paneer', qty: 1, unitPrice: 450.00, taxRate: '5%', total: 450.00, status: 'VERIFIED' },
        { name: 'Butter Roti (4 pcs)', qty: 4, unitPrice: 40.00, taxRate: '5%', total: 160.00, status: 'VERIFIED' },
        { name: 'Dum Biryani Pot', qty: 1, unitPrice: 590.00, taxRate: '5%', total: 590.00, status: 'VERIFIED' }
      ],
      taxVerdict: {
        status: 'REVIEW_RECOMMENDED',
        overchargeAmount: 120.00,
        headline: 'Voluntary Service Charge flagged for refund claim',
        actionRecommended: 'Generate CCPA waiver complaint notice'
      }
    };

    const res = await t.req('/api/bills', {
      method: 'POST',
      body: billPayload
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data._id || res.data.data.id);
    assert.strictEqual(res.data.data.restaurantName, 'The Imperial Spice Bistro');
    assert.strictEqual(res.data.data.totalAmount, 1380.00);
    t.createdBillId = res.data.data._id || res.data.data.id;
  });

  await t.run('GET /api/bills lists bills and supports search query', async () => {
    const res = await t.req('/api/bills?search=Imperial');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    const found = res.data.data.some(b => b.restaurantName?.includes('Imperial'));
    assert.ok(found, 'Search should locate the newly created bill');
  });

  await t.run('GET /api/bills/:id retrieves single bill by MongoDB ID', async () => {
    const res = await t.req(`/api/bills/${t.createdBillId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.restaurantName, 'The Imperial Spice Bistro');
  });

  await t.run('GET /api/bills/:id returns 404 for non-existent bill ID', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await t.req(`/api/bills/${fakeId}`);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('GET /api/bills/analytics/overview returns aggregated metrics', async () => {
    const res = await t.req('/api/bills/analytics/overview');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok('totalSpending' in res.data.data);
    assert.ok('totalTax' in res.data.data);
    assert.ok('totalFees' in res.data.data);
  });

  await t.run('GET /api/bills/analytics/trends returns monthly bucketed trend data', async () => {
    const res = await t.req('/api/bills/analytics/trends?months=6');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.strictEqual(res.data.data.length, 6, 'Should return exactly 6 monthly buckets');
  });

  await t.run('GET /api/bills/analytics/by-category returns statutory category breakdowns', async () => {
    const res = await t.req('/api/bills/analytics/by-category');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.some(c => c.category === 'RESTAURANT'));
  });

  // -------------------------------------------------------------
  // SUITE 4: COMPLAINT GENERATION & CCPA WORKFLOW
  // -------------------------------------------------------------
  console.log('\n📦 SUITE 4: Legal & CCPA Complaint Engine');

  await t.run('POST /api/complaints rejects missing restaurant/reason with 400', async () => {
    const res = await t.req('/api/complaints', {
      method: 'POST',
      body: { status: 'Draft' }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/complaints creates a formal CCPA grievance notice', async () => {
    const complaintPayload = {
      restaurantName: 'The Imperial Spice Bistro',
      billId: t.createdBillId,
      billNumber: 'INV-TEST-001',
      complaintReason: 'SERVICE_CHARGE',
      overchargeAmount: 120.00,
      totalBillAmount: 1380.00,
      complaintDetails: 'Demanding immediate refund of ₹120 non-mandatory service fee under CCPA Guidelines 2022.',
      status: 'Generated'
    };

    const res = await t.req('/api/complaints', {
      method: 'POST',
      body: complaintPayload
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data._id);
    assert.strictEqual(res.data.data.complaintReason, 'SERVICE_CHARGE');
    t.createdComplaintId = res.data.data._id;
  });

  await t.run('GET /api/complaints lists registered grievances', async () => {
    const res = await t.req('/api/complaints');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    const found = res.data.data.some(c => c._id === t.createdComplaintId);
    assert.ok(found, 'Created complaint should be in list');
  });

  await t.run('PATCH /api/complaints/:id/status updates dispute status to Submitted', async () => {
    const res = await t.req(`/api/complaints/${t.createdComplaintId}/status`, {
      method: 'PATCH',
      body: { status: 'Submitted' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'Submitted');
  });

  await t.run('PATCH /api/complaints/:id/status rejects illegal status enum with 400', async () => {
    const res = await t.req(`/api/complaints/${t.createdComplaintId}/status`, {
      method: 'PATCH',
      body: { status: 'ILLEGAL_STATUS_ENUM_VALUE' }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // -------------------------------------------------------------
  // SUITE 5: AI OCR / ANALYSIS & UPLOAD EDGE CASES
  // -------------------------------------------------------------
  console.log('\n📦 SUITE 5: AI Parsing & File Upload Validation');

  await t.run('POST /api/bills/upload rejects empty request body with 400', async () => {
    const res = await t.req('/api/bills/upload', {
      method: 'POST',
      body: {}
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'No image file or base64 data provided');
  });

  await t.run('POST /api/bills/analyze rejects empty/short billText with 400', async () => {
    const res = await t.req('/api/bills/analyze', {
      method: 'POST',
      body: { billText: 'hi' }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.run('POST /api/bills/analyze processes receipt text and returns audit structure', async () => {
    const billText = `
      The Royal Diner
      Date: 12/08/2026
      Paneer Butter Masala 1 x 300.00
      Garlic Naan 2 x 60.00
      Subtotal: 420.00
      CGST 2.5%: 10.50
      SGST 2.5%: 10.50
      Service Charge 10%: 42.00
      Total: 483.00
    `;
    const res = await t.req('/api/bills/analyze', {
      method: 'POST',
      body: { billText }
    });
    assert.strictEqual(res.status, 200);
    assert.ok('taxVerdict' in res.data || 'billAnalysis' in res.data || 'total' in res.data);
  });

  // -------------------------------------------------------------
  // SUITE 6: CLEANUP & INTEGRITY
  // -------------------------------------------------------------
  console.log('\n📦 SUITE 6: Teardown & Deletion Verification');

  await t.run('DELETE /api/complaints/:id deletes complaint and returns 200', async () => {
    const res = await t.req(`/api/complaints/${t.createdComplaintId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  await t.run('DELETE /api/bills/:id deletes created test bill and returns 200', async () => {
    const res = await t.req(`/api/bills/${t.createdBillId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // -------------------------------------------------------------
  // SUMMARY SCORECARD
  // -------------------------------------------------------------
  console.log('\n=================================================================');
  console.log(`  TEST RESULTS:  ${t.passed} PASSED  |  ${t.failed} FAILED  |  TOTAL: ${t.passed + t.failed}`);
  console.log('=================================================================\n');

  if (t.failed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch(err => {
  console.error('\n💥 FATAL TEST ERROR:', err);
  process.exit(1);
});
