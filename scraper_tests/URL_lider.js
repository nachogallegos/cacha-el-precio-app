const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  console.log("Navigating...");
  await page.goto('https://www.lider.cl/supermercado/search?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  
  console.log("Current URL:", page.url());
  
  // Try pressing the search input and typing "leche"
  try {
    // Look for an input
    const inputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(i => ({ type: i.type, ph: i.placeholder, id: i.id, className: i.className }));
    });
    console.log("Inputs:", inputs);
  } catch (e) {
    console.error(e);
  }
  
  await browser.close();
})();
