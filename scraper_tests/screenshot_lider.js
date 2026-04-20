const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('https://www.lider.cl/supermercado/search?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  
  await page.screenshot({ path: 'C:\\Users\\nazho\\.gemini\\antigravity\\brain\\83c6bcec-3a90-4074-b3b5-42c013e14f1e\\lider_dom_check_debug.webp', type: 'webp' });
  console.log("Screenshot saved!");
  await browser.close();
})();
