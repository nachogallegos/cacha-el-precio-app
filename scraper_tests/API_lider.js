const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  // Intercept all JSON requests to find product API
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('graphql') || url.includes('api') || url.includes('search')) {
      if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
        try {
          const text = await response.text();
          if (text.includes('leche') || text.includes('sku')) {
            console.log("\nFOUND API URL:", url);
            console.log("PAYLOAD SNEAK PEEK:", text.substring(0, 500));
          }
        } catch (e) {}
      }
    }
  });

  await page.goto('https://super.lider.cl/?query=leche', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));
  await browser.close();
})();
