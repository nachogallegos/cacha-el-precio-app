const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  let foundApi = false;

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (url.includes('.png') || url.includes('.jpg') || url.includes('.css') || url.includes('.js')) return;
      
      const req = response.request();
      if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
        const text = await response.text();
        // Check if the response looks like a Lider product list
        if (text.includes('sku') && (text.includes('price') || text.includes('displayName')) && text.length > 500) {
          console.log("\n🔥 FOUND POTENTIAL API URL:", url);
          console.log("➡️ Method:", req.method());
          console.log("➡️ Headers:", req.headers());
          if (req.postData()) {
            console.log("➡️ Payload:", req.postData().substring(0, 500));
          }
          console.log("➡️ Response Preview:", text.substring(0, 300));
          foundApi = true;
        }
      }
    } catch (e) {}
  });

  console.log("Goto Lider...");
  await page.goto('https://www.lider.cl/supermercado', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Typing 'leche' in search bar (if possible)...");
  try {
    // Try to find search input and type
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const searchBox = inputs.find(i => i.placeholder && i.placeholder.toLowerCase().includes('buscar'));
      if (searchBox) {
        searchBox.value = 'leche';
        searchBox.dispatchEvent(new Event('input', { bubbles: true }));
        // Try triggering a submit/enter if there's a form
        const form = searchBox.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        } else {
          // Dispatch Enter key event
          searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      } else {
        // Fallback: Just navigate directly assuming URL pattern
        window.location.href = 'https://www.lider.cl/supermercado/search?query=leche';
      }
    });
  } catch (err) {
    console.log("Error typing:", err);
  }

  await new Promise(r => setTimeout(r, 10000));
  
  if (!foundApi) {
    console.log("Dump raw HTML just in case Lider rendered it directly:");
    console.log(await page.evaluate(() => document.body.innerHTML.substring(0, 500)));
  }

  await browser.close();
})();
