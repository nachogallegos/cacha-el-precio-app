const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.goto('https://www.lider.cl/supermercado/search?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log("BODY TEXT:\n", text);
  await browser.close();
})();
