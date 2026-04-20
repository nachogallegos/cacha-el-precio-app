const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  await page.goto('https://super.lider.cl/?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  
  // Dump text of elements that have a price (e.g., "$ 1.250" or similar)
  const productSamples = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('div, span, a'))
      .filter(el => el.innerText && el.innerText.includes('$') && el.innerText.split('\n').length > 2)
      .map(el => {
        return {
          tag: el.tagName,
          className: el.className,
          text: el.innerText.replace(/\n/g, ' | ').substring(0, 100)
        };
      });
      
    // Filter to most likely product containers
    return texts.filter(t => t.text.includes('Leche') || t.text.toLowerCase().includes('soprole')).slice(0, 10);
  });
  
  console.log("Candidate elements:\n", productSamples);
  await browser.close();
})();
