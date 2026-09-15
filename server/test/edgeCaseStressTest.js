/**
 * Additional Edge-Case & Resilience Stress Test
 * Simulates high-concurrency, fuzzing, and boundary conditions
 */
import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runEdgeCaseTests() {
  console.log('\n=================================================================');
  console.log('       ⚡ TAXSHIELD RESILIENCE & FUZZ TESTING SUITE ⚡');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(title, fn) {
    process.stdout.write(`  ▶ ${title}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Boundary Total / Math testing in Bill Creation
  await test('POST /api/bills handles extreme decimal precision', async () => {
    const res = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantName: 'Precision Test Diner',
        totalAmount: 999.99999,
        gstAmount: 18.1818,
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.totalAmount > 0);
  });

  // 2. High concurrency bill ingestion
  await test('POST /api/bills handles 20 concurrent creation requests simultaneously', async () => {
    const requests = Array.from({ length: 20 }, (_, i) =>
      fetch(`${BASE_URL}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: `Concurrent Test Store #${i}`,
          totalAmount: 100 + i * 10,
          category: 'Dining',
        }),
      }).then(r => r.json())
    );

    const results = await Promise.all(requests);
    assert.strictEqual(results.length, 20);
    assert.ok(results.every(r => r.success === true));
  });

  // 3. Special characters & SQL / NoSQL Injection attempts in search
  await test('GET /api/bills safely handles special characters and injection vectors', async () => {
    const maliciousStrings = [
      `'`,
      `"`,
      `$where`,
      `{ "$gt": "" }`,
      `<script>alert(1)</script>`,
      `%20%27%20OR%201=1--`,
    ];

    for (const str of maliciousStrings) {
      const res = await fetch(`${BASE_URL}/api/bills?search=${encodeURIComponent(str)}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
    }
  });

  // 4. Rate / Auth spoofing resistance
  await test('GET /api/auth/me rejects expired / random forged bearer tokens', async () => {
    const fakeTokens = [
      'Bearer abcdef',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake',
      'Bearer ',
      'Basic admin:admin',
    ];

    for (const token of fakeTokens) {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: token },
      });
      assert.strictEqual(res.status, 401);
    }
  });

  // 5. Deterministic AI parser on unstructured text with noise
  await test('POST /api/bills/analyze handles OCR garbage / noisy receipt lines', async () => {
    const noisyText = `
      --- CASH MEMO ---
      *@#^!& RANDOM NOISE
      CAFE COFFEE DAY #88
      1 Cappuccino @ 220.00
      Total 220.00
      Thank you for visiting!
    `;
    const res = await fetch(`${BASE_URL}/api/bills/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billText: noisyText }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.subtotal > 0 || data.total > 0);
  });

  console.log('\n=================================================================');
  console.log(`  RESILIENCE RESULTS:  ${passed} PASSED  |  ${failed} FAILED  |  TOTAL: ${passed + failed}`);
  console.log('=================================================================\n');

  if (failed > 0) process.exit(1);
}

runEdgeCaseTests().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
