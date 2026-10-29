import { chromium } from 'playwright';

async function diagnoseBodyOverflow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  await page.addInitScript(() => {
    localStorage.setItem('aegis_cookie_consent', JSON.stringify({ essential: true, analytics: false }));
  });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth; // 1280
    // Walk through all elements and see which direct or indirect element causes body scrollWidth
    function getRootCause() {
      const offenders = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        const el = node;
        // Check if element extends past docWidth AND none of its ancestors clip overflow
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1) {
          // Check if any ancestor clips overflow
          let parent = el.parentElement;
          let clipped = false;
          while (parent && parent !== document.body && parent !== document.documentElement) {
            const style = window.getComputedStyle(parent);
            if (
              style.overflow === 'hidden' ||
              style.overflowX === 'hidden' ||
              style.overflow === 'auto' ||
              style.overflowX === 'auto' ||
              style.overflow === 'scroll' ||
              style.overflowX === 'scroll'
            ) {
              // If the parent itself is within bounds, this child is clipped!
              const pRect = parent.getBoundingClientRect();
              if (pRect.right <= docWidth + 2) {
                clipped = true;
                break;
              }
            }
            parent = parent.parentElement;
          }

          if (!clipped) {
            offenders.push({
              tag: el.tagName,
              class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
              right: Math.round(rect.right),
              excess: Math.round(rect.right - docWidth),
              outerHTML: el.outerHTML.slice(0, 150)
            });
          }
        }
      }
      return offenders;
    }

    return {
      clientWidth: docWidth,
      bodyScrollWidth: document.body.scrollWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      unclippedOffenders: getRootCause()
    };
  });

  console.log('Unclipped offenders causing body horizontal overflow:');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
}

diagnoseBodyOverflow().catch(console.error);
