const puppeteer = require('puppeteer');
const path = require('path');

const URL = process.env.SC_URL || 'https://bricemaster.github.io/sc-planner/';
const OUT_DIR = path.join(__dirname, 'v7-screenshots');

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // 1. Onboarding — fresh user (step 1)
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '01-onboarding-welcome.png') });
  console.log('1/6 Onboarding welcome');

  // 2. Click "Begin Setup" to go to step 2
  const beginBtn = await page.$('.onboard__cta');
  if (beginBtn) {
    await beginBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, '02-onboarding-ship.png') });
    console.log('2/6 Onboarding ship select');
  }

  // 3. Now set up state and reload to show dashboard
  await page.evaluate(() => {
    localStorage.setItem('scp_hasVisited', JSON.stringify(true));
    localStorage.setItem('scp_shipId', JSON.stringify('drake-corsair'));
    localStorage.setItem('scp_budget', JSON.stringify(600000));
    localStorage.setItem('scp_session', JSON.stringify(2));
    localStorage.setItem('scp_solo', JSON.stringify(true));
    localStorage.setItem('scp_skill', JSON.stringify('intermediate'));
    localStorage.setItem('scp_risk', JSON.stringify('medium'));
    localStorage.setItem('scp_goalShipId', JSON.stringify('600i-explorer'));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(OUT_DIR, '03-dashboard-full.png') });
  console.log('3/6 Dashboard full');

  // 4. Click Methods tab
  const methodsBtn = await page.$('.tab-bar__btn[data-tab="methods"]');
  if (methodsBtn) {
    await methodsBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT_DIR, '04-methods-tab.png') });
    console.log('4/6 Methods tab');
  }

  // 5. Close tab, click Ships tab
  const closeBtn = await page.$('#tabClose');
  if (closeBtn) await closeBtn.click();
  await new Promise(r => setTimeout(r, 500));
  const shipsBtn = await page.$('.tab-bar__btn[data-tab="ships"]');
  if (shipsBtn) {
    await shipsBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT_DIR, '05-ships-tab.png') });
    console.log('5/6 Ships tab');
  }

  // 6. Mobile view of dashboard
  if (closeBtn) await closeBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '06-mobile.png') });
  console.log('6/6 Mobile view');

  await browser.close();
  console.log('\nDone! Screenshots saved to ./v7-screenshots/');
})();
