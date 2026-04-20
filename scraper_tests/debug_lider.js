const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('https://www.lider.cl/supermercado/search?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  
  const testIds = await page.evaluate(() => {
    // Find elements that look like cards
    const allEls = document.querySelectorAll('*');
    const ids = new Set();
    const classNames = new Set();
    allEls.forEach(el => {
      if (el.getAttribute('data-testid') && el.getAttribute('data-testid').includes('product')) {
        ids.add(el.getAttribute('data-testid'));
      }
      if (el.className && typeof el.className === 'string' && el.className.includes('product-card')) {
        classNames.add(el.className);
      }
    });
    return { testIds: Array.from(ids), classNames: Array.from(classNames) };
  });
  
  console.log("Found data-testids containing 'product':", testIds.testIds);
  console.log("Found classes containing 'product-card':", testIds.classNames);
  
  await browser.close();
})();
