import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = '/home/xikibi/.gemini/antigravity/brain/8147b47f-e2d1-4fae-86de-60ad19edab68/screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '320x568 (iPhone SE)', width: 320, height: 568 },
  { name: '360x640 (Android baseline)', width: 360, height: 640 },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '430x932 (iPhone Pro Max)', width: 430, height: 932 },
  { name: '768x1024 (iPad portrait)', width: 768, height: 1024 },
  { name: '1280x800 (Desktop reference)', width: 1280, height: 800 },
  { name: '844x390 (Landscape phone)', width: 844, height: 390 }
];

const TABS = [
  'home',
  'heroes',
  'predictive',
  'draft',
  'arena',
  'sandbox',
  'interactions',
  'counters',
  'meta',
  'patches'
];

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.width < 1000,
      hasTouch: vp.width < 1000
    });
    const page = await context.newPage();

    // Listen to console and errors
    page.on('pageerror', err => console.log(`[PAGE ERROR ${vp.name}]:`, err.message));

    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    // Wait for animations/mount
    await page.waitForTimeout(600);

    // Test each tab
    for (const tab of TABS) {
      // Navigate via click on mobile navigation strip or desktop link, or evaluate
      await page.evaluate((targetTab) => {
        // Find navbar button for targetTab
        const btns = Array.from(document.querySelectorAll('header button'));
        for (const b of btns) {
          if (b.textContent && b.textContent.toLowerCase().includes(targetTab === 'home' ? 'command' : targetTab === 'heroes' ? 'arsenal' : targetTab === 'predictive' ? 'oracle' : targetTab)) {
            b.click();
            return;
          }
        }
      }, tab);

      await page.waitForTimeout(400);

      // Check document-level horizontal overflow
      const docOverflow = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const scrollW = Math.max(body.scrollWidth, html.scrollWidth);
        const clientW = window.innerWidth;
        const overflows = [];
        if (scrollW > clientW) {
          // Find which elements overflow
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > clientW + 1) {
              overflows.push({
                tag: el.tagName,
                className: el.className,
                id: el.id,
                right: Math.round(rect.right),
                excess: Math.round(rect.right - clientW)
              });
            }
          }
        }
        return {
          hasOverflow: scrollW > clientW + 1,
          scrollW,
          clientW,
          overflowCount: overflows.length,
          topOverflows: overflows.slice(0, 5)
        };
      });

      // Check tap targets < 44px
      const tapTargetIssues = await page.evaluate(() => {
        const interactives = Array.from(document.querySelectorAll('button, select, input, a[href]'));
        const issues = [];
        for (const el of interactives) {
          const rect = el.getBoundingClientRect();
          // Filter out hidden or collapsed elements
          if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') continue;
          if (rect.width < 43 || rect.height < 43) {
            issues.push({
              tag: el.tagName,
              text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
              className: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
              w: Math.round(rect.width),
              h: Math.round(rect.height)
            });
          }
        }
        return issues;
      });

      // Check overlapping interactive elements
      const overlapIssues = await page.evaluate(() => {
        const interactives = Array.from(document.querySelectorAll('button:not([disabled]), select, input'));
        const visible = interactives.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
        });

        const collisions = [];
        for (let i = 0; i < visible.length; i++) {
          const r1 = visible[i].getBoundingClientRect();
          for (let j = i + 1; j < visible.length; j++) {
            // If one contains the other (e.g. wrapper), skip
            if (visible[i].contains(visible[j]) || visible[j].contains(visible[i])) continue;
            const r2 = visible[j].getBoundingClientRect();
            // Check bounding box intersection
            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (xOverlap > 2 && yOverlap > 2) {
              collisions.push({
                el1: (visible[i].textContent || visible[i].getAttribute('aria-label') || visible[i].className).trim().slice(0, 30),
                el2: (visible[j].textContent || visible[j].getAttribute('aria-label') || visible[j].className).trim().slice(0, 30),
                overlapArea: Math.round(xOverlap * yOverlap)
              });
            }
          }
        }
        return collisions;
      });

      console.log(`[Tab: ${tab}] overflow: ${docOverflow.hasOverflow ? `YES (+${docOverflow.scrollW - docOverflow.clientW}px)` : 'NO'}, tapTargetIssues: ${tapTargetIssues.length}, overlaps: ${overlapIssues.length}`);

      if (docOverflow.hasOverflow || overlapIssues.length > 0 || (tab === 'heroes' && vp.width <= 390)) {
        const shotName = `${tab}_${vp.width}x${vp.height}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName), fullPage: false });
      }

      report.push({
        viewport: vp.name,
        tab,
        docOverflow,
        tapTargetIssuesCount: tapTargetIssues.length,
        tapTargetSample: tapTargetIssues.slice(0, 3),
        overlapIssues
      });
    }

    // Modal inspection: HeroBuildView
    // Click first hero in Heroes Arsenal
    await page.evaluate(() => {
      // Switch to heroes
      const btns = Array.from(document.querySelectorAll('header button'));
      for (const b of btns) {
        if (b.textContent && b.textContent.toLowerCase().includes('arsenal')) {
          b.click();
          return;
        }
      }
    });
    await page.waitForTimeout(400);

    // Click first hero card
    const heroCardFound = await page.evaluate(() => {
      const card = document.querySelector('[role="article"], .cursor-pointer.group');
      if (card) {
        card.click();
        return true;
      }
      return false;
    });

    if (heroCardFound) {
      await page.waitForTimeout(500);
      const modalChecks = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return { found: false };
        const rect = dialog.getBoundingClientRect();
        const clientW = window.innerWidth;
        const clientH = window.innerHeight;
        // Check dropdown visibility
        const posSelect = dialog.querySelector('select[aria-label="Select hero position"]');
        const posRect = posSelect ? posSelect.getBoundingClientRect() : null;
        return {
          found: true,
          dialogRect: { w: rect.width, h: rect.height, top: rect.top, bottom: rect.bottom },
          posSelectVisible: posRect ? (posRect.top >= 0 && posRect.bottom <= clientH) : false,
          posRect
        };
      });
      console.log(`[Hero Modal ${vp.name}] Found: ${modalChecks.found}, posSelectVisible: ${modalChecks.posSelectVisible}`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `hero_modal_${vp.width}x${vp.height}.png`) });
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAudit complete! Screenshots stored in:', SCREENSHOT_DIR);
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
