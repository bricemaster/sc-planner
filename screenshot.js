const puppeteer = require('puppeteer');
const path = require('path');

const URL = 'http://localhost:3860';
const OUT_DIR = path.join(__dirname, 'v6-screenshots');

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 390, height: 844 }
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Skip onboarding — keys are scp_ prefixed, JSON-stringified
  await page.evaluate(() => {
    localStorage.setItem('scp_hasVisited', JSON.stringify(true));
    localStorage.setItem('scp_shipId', JSON.stringify('cutlass-black'));
    localStorage.setItem('scp_budget', JSON.stringify(500000));
    localStorage.setItem('scp_session', JSON.stringify(2));
    localStorage.setItem('scp_solo', JSON.stringify(true));
    localStorage.setItem('scp_skill', JSON.stringify('intermediate'));
    localStorage.setItem('scp_risk', JSON.stringify('medium'));
    localStorage.setItem('scp_goalShipId', JSON.stringify('constellation-andromeda'));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Mobile screenshots
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-full.png'), fullPage: true });
  console.log('Captured: mobile-full.png');
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-above-fold.png'), fullPage: false });
  console.log('Captured: mobile-above-fold.png');

  // Desktop
  await page.setViewport({ width: 1280, height: 900 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-full.png'), fullPage: true });
  console.log('Captured: desktop-full.png');
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-above-fold.png'), fullPage: false });
  console.log('Captured: desktop-above-fold.png');

  // Wide desktop
  await page.setViewport({ width: 1920, height: 1080 });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'wide-desktop.png'), fullPage: false });
  console.log('Captured: wide-desktop.png');

  await page.close();
  await browser.close();
  console.log('\nDone! 5 screenshots saved to ./v6-screenshots/');
})();
