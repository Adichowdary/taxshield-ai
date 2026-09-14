import assert from 'assert';
import http from 'http';

// Helper to make local HTTP requests
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  // Start server on a test port
  process.env.PORT = '5099';
  const { server } = await import('../index.js');

  console.log('\n--- Running API Route & Validation Tests on Port 5099 ---');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const health = await request({
      hostname: 'localhost',
      port: 5099,
      path: '/api/health',
      method: 'GET',
    });
    assert.strictEqual(health.statusCode, 200);
    assert.strictEqual(health.body.status, 'ok');
    assert.strictEqual(health.body.database, 'MongoDB');
    console.log('   Health check passed.');

    // 2. Auth Register Validation
    console.log('2. Testing POST /api/auth/register validation...');
    const regRes = await request(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Missing Email' }
    );
    assert.strictEqual(regRes.statusCode, 400);
    assert.strictEqual(regRes.body.success, false);
    console.log('   Register validation passed.');

    // 3. Auth Login Validation
    console.log('3. Testing POST /api/auth/login validation...');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {}
    );
    assert.strictEqual(loginRes.statusCode, 400);
    assert.strictEqual(loginRes.body.success, false);
    console.log('   Login validation passed.');

    // 4. Bills Upload without file
    console.log('4. Testing POST /api/bills/upload without file...');
    const uploadRes = await request(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/bills/upload',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {}
    );
    assert.strictEqual(uploadRes.statusCode, 400);
    assert.strictEqual(uploadRes.body.success, false);
    console.log('   Upload validation passed.');

    // 5. Complaints validation
    console.log('5. Testing POST /api/complaints validation...');
    const compRes = await request(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/complaints',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { restaurantName: 'Test' }
    );
    assert.strictEqual(compRes.statusCode, 400);
    assert.strictEqual(compRes.body.success, false);
    console.log('   Complaint validation passed.');

    console.log('\nAll Express routes and validation tests PASSED successfully!');
  } finally {
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => {
      process.exit(0);
    }, 1500);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

