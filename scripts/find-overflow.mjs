import { chromium } from 'playwright';

async function findOverflow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  await page.addInitScript(() => {
    localStorage.setItem('aegis_cookie_consent', JSON.stringify({ essential: true, analytics: false }));
  });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const overflowElements = await page.evaluate(() => {
    const docWidth = window.innerWidth;
    const all = Array.from(document.querySelectorAll('*'));
    const offending = [];

    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) {
        offending.push({
          tag: el.tagName,
          id: el.id,
          className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            right: Math.round(rect.right),
            overflow: Math.round(rect.right - docWidth)
          }
        });
      }
    }

    return offending.sort((a, b) => b.rect.right - a.rect.right).slice(0, 15);
  });

  console.log('Top overflow elements at 1280x800:');
  console.log(JSON.stringify(overflowElements, null, 2));

  await browser.close();
}

findOverflow().catch(console.error);
