const puppeteer = require('puppeteer');

async function debugLiderLabels() {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  const url = 'https://www.lider.cl/supermercado/search?query=leche';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Scroll a bit
  await page.evaluate(() => window.scrollBy(0, 2000));
  await new Promise(r => setTimeout(r, 3000));

  const labels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button'))
      .map(b => b.getAttribute('aria-label'))
      .filter(l => l && l.includes('Agregar'))
      .slice(0, 20);
  });

  console.log('--- FIRST 20 ARIA-LABELS ---');
  labels.forEach((l, i) => console.log(`${i+1}: ${l}`));
  await browser.close();
}

debugLiderLabels();
