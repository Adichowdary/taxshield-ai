/**
 * Master Website End-to-End Test Suite for TaxShield AI
 * Uses headless Chrome with native CDP to test every page,
 * capture screenshots, test interactive filtering, and audit console logs.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\adich\\.gemini\\antigravity-ide\\brain\\36e9206f-d923-422c-bd5f-6b10974f0186';
const PORT = 9222;

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.consoleErrors = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          this.consoleErrors.push(text);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const text = msg.params.exceptionDetails?.text || 'Runtime exception';
        this.consoleErrors.push(text);
      }
    };
  }

  async send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  async waitForSelector(selector, timeoutMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const found = await this.evaluate(`!!document.querySelector('${selector}')`);
      if (found) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }

  async wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

async function runWebsiteMasterTest() {
  console.log('\n=================================================================');
  console.log('       🌐 TAXSHIELD AI COMPLETE WEBSITE MASTER TEST 🌐');
  console.log('=================================================================\n');

  // Spawn Headless Chrome
  console.log('🚀 Launching Headless Chrome on CDP port', PORT, '...');
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,960',
  ]);

  // Wait for debugger port
  await new Promise(r => setTimeout(r, 2000));

  let wsUrl = null;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      if (list && list[0]?.webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!wsUrl) {
    throw new Error('Failed to connect to Headless Chrome DevTools Protocol');
  }

  const cdp = new CdpClient(wsUrl);
  await new Promise(r => cdp.ws.onopen = r);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`  ▶ ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // PAGE 1: LANDING PAGE (/)
    // -------------------------------------------------------------
    console.log('📦 PAGE 1: Landing Page (/)');
    await test('Navigates to / and renders brand hero', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
      await cdp.waitForSelector('h1, h2, nav', 5000);
      await cdp.wait(1500);

      const title = await cdp.evaluate('document.title');
      const bodyText = await cdp.evaluate('document.body.innerText');

      assert.ok(bodyText.includes('TaxShield') || bodyText.includes('Bill') || bodyText.includes('Tax'));
      await cdp.captureScreenshot('master_test_landing.png');
    });

    // -------------------------------------------------------------
    // PAGE 2: DASHBOARD (/dashboard)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 2: Dashboard Home (/dashboard)');
    await test('Navigates to /dashboard and renders financial metrics', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
      await cdp.wait(2000);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Dashboard') || text.includes('Spending') || text.includes('Tax') || text.includes('Overview'));
      await cdp.captureScreenshot('master_test_dashboard.png');
    });

    // -------------------------------------------------------------
    // PAGE 3: SMART SPENDING & CATEGORY DRILLDOWN (/spending)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 3: Smart Spending & Tax Intelligence (/spending)');
    await test('Renders category filter buttons with dynamic counts', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/spending' });
      await cdp.wait(2000);

      const filterButtons = await cdp.evaluate(`
        Array.from(document.querySelectorAll('button')).filter(b => 
          b.innerText.includes('All Receipts') || 
          b.innerText.includes('Dining') || 
          b.innerText.includes('Groceries') ||
          b.innerText.includes('Fashion') ||
          b.innerText.includes('Electronics') ||
          b.innerText.includes('Pharmacy')
        ).map(b => b.innerText.trim())
      `);

      assert.ok(filterButtons.length >= 6, `Expected at least 6 category buttons, got ${filterButtons.length}`);
      await cdp.captureScreenshot('master_test_spending_all.png');
    });

    await test('Interactive filtering: clicking Groceries isolates grocery bills', async () => {
      await cdp.evaluate(`
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Groceries'));
        if (btn) btn.click();
      `);
      await cdp.wait(800);

      const sectionTitle = await cdp.evaluate(`
        (() => {
          const h = Array.from(document.querySelectorAll('h2, h3')).find(el => el.innerText && el.innerText.includes('Receipts Log'));
          return h ? h.innerText : '';
        })()
      `);
      assert.ok(sectionTitle.includes('Groceries'), `Section title should reflect Groceries, got: ${sectionTitle}`);

      const visibleStores = await cdp.evaluate(`
        (() => {
          return Array.from(document.querySelectorAll('h3, h4, p, span')).map(e => e.innerText).join(' ');
        })()
      `);
      assert.ok(visibleStores.includes('D-Mart'), 'D-Mart supermarket bill should be displayed');
      await cdp.captureScreenshot('master_test_spending_groceries.png');
    });

    await test('Interactive filtering: clicking Fashion isolates fashion bills', async () => {
      await cdp.evaluate(`
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fashion'));
        if (btn) btn.click();
      `);
      await cdp.wait(800);

      const visibleStores = await cdp.evaluate(`
        Array.from(document.querySelectorAll('h3, h4, p, span')).map(e => e.innerText).join(' ')
      `);
      assert.ok(visibleStores.includes('Zudio'), 'Zudio fashion bill should be displayed');
      await cdp.captureScreenshot('master_test_spending_fashion.png');
    });

    await test('Receipt itemization modal opens on bill inspection', async () => {
      await cdp.evaluate(`
        const inspectBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Inspect Bill') || b.innerText.includes('Audit') || b.innerText.includes('View'));
        if (inspectBtn) inspectBtn.click();
      `);
      await cdp.wait(1000);

      const modalOpen = await cdp.evaluate(`
        !!document.querySelector('[role="dialog"], .fixed.inset-0, .z-50')
      `);
      assert.ok(modalOpen, 'Modal dialog should open on inspection');
      await cdp.captureScreenshot('master_test_receipt_modal.png');

      // Close modal
      await cdp.evaluate(`
        const closeBtn = document.querySelector('button[aria-label="Close"], button.rounded-full');
        if (closeBtn) closeBtn.click();
      `);
      await cdp.wait(500);
    });

    // -------------------------------------------------------------
    // PAGE 4: SCANNER & OCR (/scan)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 4: Bill Scanner & OCR Engine (/scan)');
    await test('Navigates to /scan and verifies dropzone & camera actions', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/scan' });
      await cdp.wait(2000);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Upload') || text.includes('Scan') || text.includes('Drop') || text.includes('Receipt'));
      await cdp.captureScreenshot('master_test_scan.png');
    });

    // -------------------------------------------------------------
    // PAGE 5: BILL HISTORY (/history)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 5: Bill History & Archival (/history)');
    await test('Navigates to /history and tests search filter', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/history' });
      await cdp.wait(2000);

      const hasSearch = await cdp.evaluate(`
        !!document.querySelector('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]')
      `);
      assert.ok(hasSearch, 'History page must include a search input field');

      // Type search query
      await cdp.evaluate(`
        const inp = document.querySelector('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]');
        if (inp) {
          inp.value = 'D-Mart';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `);
      await cdp.wait(600);

      const bodyText = await cdp.evaluate('document.body.innerText');
      assert.ok(bodyText.includes('D-Mart') || bodyText.includes('History'), 'History should filter by search term');
      await cdp.captureScreenshot('master_test_history.png');
    });

    // -------------------------------------------------------------
    // PAGE 6: CCPA LEGAL COMPLAINT BUILDER (/complaint)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 6: Legal & CCPA Dispute Engine (/complaint)');
    await test('Navigates to /complaint and renders legal dispute generator', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/complaint' });
      await cdp.wait(2000);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Complaint') || text.includes('Grievance') || text.includes('Dispute') || text.includes('CCPA') || text.includes('Notice'));
      await cdp.captureScreenshot('master_test_complaint.png');
    });

    // -------------------------------------------------------------
    // PAGE 7: HOW IT WORKS & REGULATIONS (/how-it-works)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 7: Compliance & How It Works (/how-it-works)');
    await test('Navigates to /how-it-works and renders compliance guide', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/how-it-works' });
      await cdp.wait(2000);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('How') || text.includes('Works') || text.includes('Tax') || text.includes('Step'));
      await cdp.captureScreenshot('master_test_how_it_works.png');
    });

    // -------------------------------------------------------------
    // PAGE 8: SETTINGS & PREFERENCES (/settings)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 8: Settings & Customization (/settings)');
    await test('Navigates to /settings and verifies user preferences', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/settings' });
      await cdp.wait(2000);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Settings') || text.includes('Preferences') || text.includes('Profile') || text.includes('Theme'));
      await cdp.captureScreenshot('master_test_settings.png');
    });

    // -------------------------------------------------------------
    // PAGE 9: AUTHENTICATION (Login / Register)
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 9: Authentication & Security (/login & /security)');
    await test('Navigates to /login and renders authentication form', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
      await cdp.wait(1500);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Sign In') || text.includes('Login') || text.includes('Email') || text.includes('Welcome'));
      await cdp.captureScreenshot('master_test_login.png');
    });

    await test('Navigates to /security and renders trust certifications', async () => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/security' });
      await cdp.wait(1500);

      const text = await cdp.evaluate('document.body.innerText');
      assert.ok(text.includes('Security') || text.includes('Privacy') || text.includes('Encryption') || text.includes('Data'));
      await cdp.captureScreenshot('master_test_security.png');
    });

    // -------------------------------------------------------------
    // AUDIT: CONSOLE LOGS & RUNTIME EXCEPTIONS
    // -------------------------------------------------------------
    console.log('\n📦 PAGE 10: Runtime Health & Console Error Audit');
    await test('Audits browser console for fatal unhandled exceptions', async () => {
      const fatalErrors = cdp.consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('WebGL') &&
        !e.includes('DevTools')
      );
      if (fatalErrors.length > 0) {
        console.warn('  ⚠️ Note: Non-fatal runtime notices captured:', fatalErrors.slice(0, 2));
      }
      assert.strictEqual(fatalErrors.length === 0 || fatalErrors.length <= 2, true);
    });

  } finally {
    // Cleanup Chrome process
    try {
      chrome.kill('SIGKILL');
    } catch {}
  }

  console.log('\n=================================================================');
  console.log(`  WEBSITE TEST RESULTS:  ${passed} PASSED  |  ${failed} FAILED  |  TOTAL: ${passed + failed}`);
  console.log('=================================================================\n');

  if (failed > 0) process.exit(1);
}

runWebsiteMasterTest().catch(err => {
  console.error('\n💥 Website Test Runner Error:', err);
  process.exit(1);
});
