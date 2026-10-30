import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '../apps/web/node_modules/@playwright/test/index.mjs';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = join(ROOT, 'docs', 'screenshots');

if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function main() {
  console.log('Starting production server...');
  const server = spawn('pnpm', ['-C', 'apps/web', 'start', '-p', '3000'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  try {
    await waitForServer('http://localhost:3000');
    console.log('Server is ready. Launching browser...');

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // 1. Home page
    console.log('Capturing Home page...');
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid="cart-badge"][data-hydrated="true"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'home.png'), fullPage: false });
    console.log('✓ Home page captured');

    // 2. Restaurant page
    console.log('Capturing Restaurant page...');
    await page.goto('http://localhost:3000/restaurant/pho-gia-truyen-bat-dan');
    await page.waitForSelector('[data-testid="cart-badge"][data-hydrated="true"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'restaurant.png'), fullPage: false });
    console.log('✓ Restaurant page captured');

    // 3. Cart Drawer open with items
    console.log('Capturing Cart Drawer with items...');
    const addBtn1 = page.getByRole('button', { name: /Thêm Phở Bò Tái Chín/i });
    await addBtn1.click();
    await page.waitForTimeout(400);
    const addBtn2 = page.getByRole('button', { name: /Thêm Phở Bò Tái Nạm Gầu/i });
    await addBtn2.click();
    await page.waitForTimeout(400);

    const badge = page.getByTestId('cart-badge');
    await badge.click();
    await page.waitForSelector('[data-testid="cart-drawer"]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'cart-drawer.png'), fullPage: false });
    console.log('✓ Cart Drawer captured');

    // 4. Checkout validation errors
    console.log('Capturing Checkout validation errors...');
    const checkoutLink = page.getByTestId('cart-checkout-link-pho-gia-truyen-bat-dan');
    await checkoutLink.click();
    await page.waitForSelector('[data-testid="checkout-form"]');
    // Click submit without entering required inputs
    const submitBtn = page.getByTestId('checkout-submit-button');
    await submitBtn.click();
    await page.waitForSelector('#fullName-error');
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'checkout-errors.png'), fullPage: false });
    console.log('✓ Checkout errors captured');

    // 5. Order confirmation
    console.log('Capturing Order confirmation...');
    await page.locator('#fullName').fill('Nguyễn Văn An');
    await page.locator('#phone').fill('0901234567');
    await page.locator('#address').fill('49 Bát Đàn, Quận Hoàn Kiếm, Hà Nội');
    await page.locator('#note').fill('Xin thêm nhiều ớt tươi và chanh');
    await submitBtn.click();
    await page.waitForSelector('[data-testid="order-confirmation"]');
    await page.waitForSelector('[data-testid="order-code"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'order-confirmation.png'), fullPage: false });
    console.log('✓ Order confirmation captured');

    await browser.close();
    console.log('All screenshots captured successfully!');
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
