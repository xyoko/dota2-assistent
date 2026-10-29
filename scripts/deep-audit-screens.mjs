import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = '/home/xikibi/.gemini/antigravity/brain/8147b47f-e2d1-4fae-86de-60ad19edab68/screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '844x390', width: 844, height: 390 }
];

const SCREENS = [
  { id: 'home', label: 'Command' },
  { id: 'heroes', label: 'Arsenal' },
  { id: 'predictive', label: 'Oracle 5v5' },
  { id: 'draft', label: 'Draft' },
  { id: 'arena', label: 'Arena' },
  { id: 'meta', label: 'Meta' },
  { id: 'sandbox', label: 'Build Sandbox' },
  { id: 'interactions', label: 'Item Interactions' },
  { id: 'counters', label: 'Threat Counters' },
  { id: 'patches', label: 'Patch 7.37d' },
  { id: 'archive', label: 'Tactical Notes' }
];

async function runDeepAudit() {
  const browser = await chromium.launch({ headless: true });
  const allIssues = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.width < 1000,
      hasTouch: vp.width < 1000
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.setItem('aegis_cookie_consent', JSON.stringify({ essential: true, analytics: false }));
    });

    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    for (const screen of SCREENS) {
      // Navigate to screen
      await page.evaluate((targetLabel) => {
        // Try top/mobile buttons
        const btns = Array.from(document.querySelectorAll('header button'));
        for (const b of btns) {
          if (b.textContent && b.textContent.includes(targetLabel)) {
            b.click();
            return;
          }
        }
        // If not in primary buttons, check More menu
        const moreBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent && b.textContent.includes('Tools'));
        if (moreBtn) {
          moreBtn.click();
          const dropBtns = Array.from(document.querySelectorAll('header div button'));
          const target = dropBtns.find(b => b.textContent && b.textContent.includes(targetLabel));
          if (target) target.click();
        }
      }, screen.label);

      await page.waitForTimeout(500);

      // Take clean screenshot
      const shotName = `${screen.id}_${vp.name}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName), fullPage: false });

      // Run deep DOM inspection
      const screenDiagnostics = await page.evaluate((info) => {
        const issues = [];
        const clientW = window.innerWidth;
        const clientH = window.innerHeight;

        // 1. Horizontal page overflow
        const docScrollW = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
        if (docScrollW > clientW + 2) {
          issues.push({
            type: 'PAGE_HORIZONTAL_OVERFLOW',
            severity: 'major',
            description: `Document scrollWidth (${docScrollW}px) exceeds viewport width (${clientW}px) by ${docScrollW - clientW}px.`,
            fileHint: 'src/App.tsx'
          });
        }

        // 2. Interactive elements collisions / overlaps
        const interactives = Array.from(document.querySelectorAll('button:not([disabled]), select, input, a[href]')).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';
        });

        for (let i = 0; i < interactives.length; i++) {
          const el1 = interactives[i];
          const r1 = el1.getBoundingClientRect();
          for (let j = i + 1; j < interactives.length; j++) {
            const el2 = interactives[j];
            if (el1.contains(el2) || el2.contains(el1)) continue;
            const r2 = el2.getBoundingClientRect();

            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));

            // Significant collision
            if (xOverlap > 4 && yOverlap > 4) {
              issues.push({
                type: 'ELEMENT_COLLISION',
                severity: 'blocker',
                description: `Collision between "${(el1.textContent || el1.getAttribute('aria-label') || el1.className).trim().slice(0, 30)}" and "${(el2.textContent || el2.getAttribute('aria-label') || el2.className).trim().slice(0, 30)}" (${Math.round(xOverlap)}x${Math.round(yOverlap)}px intersection).`,
                rect1: { w: Math.round(r1.width), h: Math.round(r1.height), left: Math.round(r1.left), right: Math.round(r1.right) },
                rect2: { w: Math.round(r2.width), h: Math.round(r2.height), left: Math.round(r2.left), right: Math.round(r2.right) }
              });
            }
          }
        }

        // 3. Crowded / crushed chips (width crushed below content, causing text overlap)
        const chips = Array.from(document.querySelectorAll('.flex > button, .inline-flex > button, [role="tab"]'));
        for (const chip of chips) {
          const r = chip.getBoundingClientRect();
          if (r.width > 0 && r.width < 50 && (chip.textContent || '').trim().length > 6) {
            issues.push({
              type: 'CRUSHED_FILTER_CHIP',
              severity: 'blocker',
              description: `Filter button "${chip.textContent?.trim()}" crushed to ${Math.round(r.width)}px width, causing text overlap with adjacent chips.`,
              actualW: Math.round(r.width),
              text: chip.textContent?.trim()
            });
          }
        }

        // 4. Tap target violations (< 44px)
        const touchViolations = [];
        for (const el of interactives) {
          const r = el.getBoundingClientRect();
          if (r.width < 43 || r.height < 43) {
            // Exclude desktop-only viewports (1280x800)
            if (clientW < 1000) {
              touchViolations.push({
                text: (el.textContent || el.getAttribute('aria-label') || el.className).trim().slice(0, 25),
                w: Math.round(r.width),
                h: Math.round(r.height),
                tag: el.tagName
              });
            }
          }
        }
        if (touchViolations.length > 0) {
          issues.push({
            type: 'TOUCH_TARGET_SUB_44PX',
            severity: 'minor',
            description: `${touchViolations.length} interactive controls have touch target height or width below 44px.`,
            sample: touchViolations.slice(0, 4)
          });
        }

        // 5. Container horizontal overflow without scrolling or clipping outside viewport
        const containers = Array.from(document.querySelectorAll('div, section, main')).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > clientW + 2 && r.right > clientW + 2;
        });
        if (containers.length > 0) {
          issues.push({
            type: 'CONTAINER_OVERFLOW',
            severity: 'major',
            description: `${containers.length} containers overflow the viewport edge by up to ${Math.round(containers[0].getBoundingClientRect().right - clientW)}px.`,
            classSample: containers[0].className?.slice(0, 60)
          });
        }

        return issues;
      }, { screenId: screen.id, vpName: vp.name });

      if (screenDiagnostics.length > 0) {
        console.log(`[${vp.name}] ${screen.id}: ${screenDiagnostics.map(d => d.type).join(', ')}`);
        for (const diag of screenDiagnostics) {
          allIssues.push({
            viewport: vp.name,
            screen: screen.id,
            ...diag
          });
        }
      }
    }

    // Modal check: HeroBuildView
    await page.evaluate(() => {
      // Navigate to heroes arsenal
      const btn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent && b.textContent.includes('Arsenal'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(400);

    const openedHero = await page.evaluate(() => {
      // Find hero card in virtualized grid
      const cards = Array.from(document.querySelectorAll('.cursor-pointer, [data-hero-id]'));
      for (const c of cards) {
        if (c.textContent && (c.textContent.includes('WR') || c.textContent.includes('King') || c.textContent.includes('Spectre'))) {
          c.click();
          return true;
        }
      }
      return false;
    });

    if (openedHero) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `hero_modal_open_${vp.name}.png`), fullPage: false });

      const modalDiagnostics = await page.evaluate((vpInfo) => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return [];
        const clientW = window.innerWidth;
        const clientH = window.innerHeight;
        const dRect = dialog.getBoundingClientRect();
        const issues = [];

        // Check if modal clips horizontally
        if (dRect.right > clientW + 2 || dRect.left < -2) {
          issues.push({
            type: 'MODAL_HORIZONTAL_OVERFLOW',
            severity: 'blocker',
            description: `Modal dialog overflows viewport (${Math.round(dRect.width)}px width in ${clientW}px viewport).`
          });
        }

        // Check position selector in modal
        const posSelect = dialog.querySelector('select[aria-label="Select hero position"]');
        if (posSelect) {
          const sRect = posSelect.getBoundingClientRect();
          if (sRect.width < 44 || sRect.height < 44) {
            issues.push({
              type: 'POSITION_SELECTOR_TAP_TARGET',
              severity: 'minor',
              description: `Position selector has sub-44px target (${Math.round(sRect.width)}x${Math.round(sRect.height)}px).`
            });
          }
          if (sRect.right > clientW) {
            issues.push({
              type: 'POSITION_SELECTOR_OVERFLOW',
              severity: 'major',
              description: `Position selector overflows viewport right bound by ${Math.round(sRect.right - clientW)}px.`
            });
          }
        }

        // Check sub-tabs in modal (build, skills, matchups, strategy, notes)
        const subTabs = Array.from(dialog.querySelectorAll('nav button, [role="tab"]'));
        for (let i = 0; i < subTabs.length; i++) {
          const t1 = subTabs[i].getBoundingClientRect();
          for (let j = i + 1; j < subTabs.length; j++) {
            const t2 = subTabs[j].getBoundingClientRect();
            if (Math.abs(t1.top - t2.top) < 5 && Math.min(t1.right, t2.right) > Math.max(t1.left, t2.left)) {
              issues.push({
                type: 'MODAL_TAB_COLLISION',
                severity: 'major',
                description: `Modal sub-tabs "${subTabs[i].textContent?.trim()}" and "${subTabs[j].textContent?.trim()}" overlap horizontally.`
              });
            }
          }
        }

        return issues;
      }, { vpName: vp.name });

      for (const diag of modalDiagnostics) {
        allIssues.push({
          viewport: vp.name,
          screen: 'HeroBuildView (Modal)',
          ...diag
        });
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // Modal check: CommandPalette (Cmd+K)
    await page.keyboard.down('Meta');
    await page.keyboard.press('k');
    await page.keyboard.up('Meta');
    await page.waitForTimeout(300);
    const cmdPaletteFound = await page.evaluate(() => {
      const palette = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (palette) {
        return true;
      }
      return false;
    });
    if (cmdPaletteFound) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `command_palette_${vp.name}.png`), fullPage: false });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`DEEP AUDIT FINISHED: Found ${allIssues.length} issue occurrences across all viewports.`);
  console.log(`========================================`);

  // Write issues log
  const fs = await import('node:fs');
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'audit_report.json'), JSON.stringify(allIssues, null, 2), 'utf-8');
  console.log('Saved audit report to:', path.join(SCREENSHOT_DIR, 'audit_report.json'));
}

runDeepAudit().catch(err => {
  console.error('Deep audit failed:', err);
  process.exit(1);
});
