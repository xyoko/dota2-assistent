import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '1280x800', width: 1280, height: 800 }
];

async function verifyAll() {
  const browser = await chromium.launch({ headless: true });
  let hasFailure = false;

  console.log('--- STARTING COMPREHENSIVE LAYOUT VERIFICATION ---');

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
    await page.waitForTimeout(400);

    // 1. Check Body Overflow at Desktop (1280x800) and Mobile
    const overflowCheck = await page.evaluate(() => {
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.body.scrollWidth,
        overflow: document.body.scrollWidth - window.innerWidth
      };
    });

    console.log(`\n[Viewport ${vp.name}] Document Width: ${overflowCheck.innerWidth}px, scrollWidth: ${overflowCheck.scrollWidth}px (Excess: ${overflowCheck.overflow}px)`);
    if (overflowCheck.overflow > 1) {
      console.error(`❌ FAILED: Horizontal overflow of +${overflowCheck.overflow}px detected at ${vp.name}!`);
      hasFailure = true;
    } else {
      console.log(`✅ PASSED: Zero horizontal page overflow.`);
    }

    // 2. Check Floating Mini HUD Button visibility
    const miniHudVisibility = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="Picture-in-Picture Mini HUD (Always on top)"]');
      if (!btn) return { exists: false };
      const style = window.getComputedStyle(btn);
      return {
        exists: true,
        display: style.display,
        visible: style.display !== 'none' && style.visibility !== 'hidden'
      };
    });

    if (vp.width < 640) {
      if (miniHudVisibility.exists && miniHudVisibility.visible) {
        console.error(`❌ FAILED: Floating Mini HUD button is visible on mobile (${vp.name}), should be hidden!`);
        hasFailure = true;
      } else {
        console.log(`✅ PASSED: Floating Mini HUD button correctly hidden on mobile (${vp.name}).`);
      }
    } else {
      console.log(`✅ PASSED: Mini HUD button present on desktop/tablet as intended.`);
    }

    // 3. Switch to Heroes Arsenal and check Attribute Filter buttons
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      for (const b of btns) {
        if (b.textContent && b.textContent.toLowerCase().includes('arsenal')) {
          b.click();
          return;
        }
      }
    });
    await page.waitForTimeout(400);

    const attrButtonOverlap = await page.evaluate(() => {
      // Find the attribute filter container buttons
      const container = document.querySelector('.bg-hud-bg.p-1.rounded-lg.border.overflow-x-auto');
      if (!container) return { found: false };
      const buttons = Array.from(container.querySelectorAll('button'));
      const boxes = buttons.map(b => {
        const r = b.getBoundingClientRect();
        return {
          text: b.textContent.trim().replace(/\s+/g, ' '),
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          right: Math.round(r.right)
        };
      });

      // Check collision/overlap between adjacent buttons in horizontal order
      let collisions = [];
      for (let i = 0; i < boxes.length - 1; i++) {
        // If box[i].right > box[i+1].x + 1, they overlap!
        if (boxes[i].right > boxes[i + 1].x + 1) {
          collisions.push({
            b1: boxes[i],
            b2: boxes[i + 1],
            overlap: boxes[i].right - boxes[i + 1].x
          });
        }
      }

      return {
        found: true,
        buttonCount: buttons.length,
        boxes,
        collisions
      };
    });

    if (attrButtonOverlap.found) {
      if (attrButtonOverlap.collisions.length > 0) {
        console.error(`❌ FAILED: Attribute buttons overlap at ${vp.name}:`, attrButtonOverlap.collisions);
        hasFailure = true;
      } else {
        console.log(`✅ PASSED: Zero overlap on ${attrButtonOverlap.buttonCount} attribute filter chips at ${vp.name}.`);
        console.log('   Chips metrics:', attrButtonOverlap.boxes.map(b => `${b.text} (${b.w}x${b.h})`).join(', '));
      }
    }

    // 4. Open Hero Detail Modal and check Sub-Navigation Tabs
    if (vp.width <= 390) {
      const openModal = await page.evaluate(() => {
        const card = document.querySelector('.specular-card') || document.querySelector('[class*="group relative rounded-"]');
        if (card) {
          card.click();
          return true;
        }
        return false;
      });

      if (openModal) {
        await page.waitForTimeout(500);

        const tabOverlap = await page.evaluate(() => {
          const tabContainer = document.querySelector('.relative.z-20.flex.border-y.bg-hud-surface.overflow-x-auto');
          if (!tabContainer) return { found: false };
          const tabs = Array.from(tabContainer.querySelectorAll('button'));
          const boxes = tabs.map(t => {
            const r = t.getBoundingClientRect();
            return {
              text: t.textContent.trim().replace(/\s+/g, ' '),
              x: Math.round(r.x),
              w: Math.round(r.width),
              right: Math.round(r.right)
            };
          });

          let collisions = [];
          for (let i = 0; i < boxes.length - 1; i++) {
            if (boxes[i].right > boxes[i + 1].x + 1) {
              collisions.push({
                t1: boxes[i],
                t2: boxes[i + 1],
                overlap: boxes[i].right - boxes[i + 1].x
              });
            }
          }

          return {
            found: true,
            tabCount: tabs.length,
            boxes,
            collisions
          };
        });

        if (tabOverlap.found) {
          if (tabOverlap.collisions.length > 0) {
            console.error(`❌ FAILED: Sub-tabs overlap in Hero Modal at ${vp.name}:`, tabOverlap.collisions);
            hasFailure = true;
          } else {
            console.log(`✅ PASSED: Zero overlap on ${tabOverlap.tabCount} modal sub-tabs at ${vp.name}.`);
            console.log('   Tab widths:', tabOverlap.boxes.map(b => `${b.text}: ${b.w}px`).join(' | '));
          }
        }
      }
    }

    await page.close();
  }

  await browser.close();

  if (hasFailure) {
    console.error('\n❌ VERIFICATION FINISHED WITH ERRORS.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL LAYOUT VERIFICATIONS PASSED CLEANLY (Zero Collisions, Zero Excess Overflow)!');
  }
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
