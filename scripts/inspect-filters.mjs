import { chromium } from 'playwright';
import path from 'node:path';

const SCREENSHOT_DIR = '/home/xikibi/.gemini/antigravity/brain/8147b47f-e2d1-4fae-86de-60ad19edab68/screenshots';

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '844x390', width: 844, height: 390 }
];

async function inspectFilters() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.width < 1000,
      hasTouch: vp.width < 1000
    });

    await page.addInitScript(() => {
      localStorage.setItem('aegis_cookie_consent', JSON.stringify({ essential: true, analytics: false }));
    });

    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Switch to Heroes Arsenal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      for (const b of btns) {
        if (b.textContent && b.textContent.toLowerCase().includes('arsenal')) {
          b.click();
          return;
        }
      }
    });
    await page.waitForTimeout(600);

    // Take screenshot of Heroes Arsenal Filter section
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `arsenal_filters_${vp.name}.png`),
      fullPage: false
    });

    // Inspect HeroFilterBar layout metrics
    const filterMetrics = await page.evaluate(() => {
      // Find filter bar
      const filterBar = document.querySelector('.bg-hud-panel.border.border-white\\/\\[0\\.08\\].rounded-xl');
      if (!filterBar) return { found: false };

      const rect = filterBar.getBoundingClientRect();
      const clientW = window.innerWidth;

      // Children inspection
      const rows = Array.from(filterBar.children);
      const rowDetails = rows.map((row, idx) => {
        const rRect = row.getBoundingClientRect();
        const buttons = Array.from(row.querySelectorAll('button, select'));
        return {
          rowIdx: idx,
          w: Math.round(rRect.width),
          h: Math.round(rRect.height),
          scrollW: row.scrollWidth,
          clientW: row.clientWidth,
          hasScroll: row.scrollWidth > row.clientWidth,
          itemCount: buttons.length,
          items: buttons.map(b => {
            const bRect = b.getBoundingClientRect();
            return {
              text: (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
              w: Math.round(bRect.width),
              h: Math.round(bRect.height),
              left: Math.round(bRect.left),
              right: Math.round(bRect.right),
              top: Math.round(bRect.top),
              bottom: Math.round(bRect.bottom)
            };
          })
        };
      });

      return {
        found: true,
        barW: Math.round(rect.width),
        clientW,
        excess: Math.round(rect.width - clientW),
        rowDetails
      };
    });

    console.log(`\n=== VIEWPORT ${vp.name} FILTER METRICS ===`);
    console.log(JSON.stringify(filterMetrics, null, 2));

    await page.close();
  }

  await browser.close();
}

inspectFilters().catch(console.error);
