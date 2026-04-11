const puppeteer = require('puppeteer');

async function inspectLider() {
  console.log('\n[🔍] Inspeccionando Lider.cl...');
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });
  
  const url = 'https://www.lider.cl/supermercado/search?query=leche&searchType=category';
  console.log(`[→] Abriendo: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
  } catch(e) {
    console.log('[WARN] Timeout parcial, continuando...');
  }
  
  // Scroll para lazy-load
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 400);
        total += 400;
        if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
      }, 150);
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Capturar screenshot
  await page.screenshot({ path: 'lider_debug.png' });
  console.log('[📸] Screenshot guardado: lider_debug.png');

  // Texto visible de la página
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log('\n=== TEXTO VISIBLE DE LIDER ===');
  console.log(bodyText);

  // Clases CSS que contienen precios
  const classesWithPrice = await page.evaluate(() => {
    const allEls = document.querySelectorAll('*');
    let found = [];
    allEls.forEach(el => {
      const txt = el.innerText || '';
      if (txt.includes('$') && txt.length < 400 && txt.length > 15 && el.className && typeof el.className === 'string') {
        const cls = el.className.substring(0, 100);
        if (found.length < 12 && !found.some(f => f.class === cls)) {
          found.push({ class: cls, text: txt.substring(0, 80).replace(/\n/g, ' | ') });
        }
      }
    });
    return found;
  });

  console.log('\n=== CLASES CSS CON PRECIOS ===');
  classesWithPrice.forEach((item, i) => {
    console.log(`\n[${i+1}] CLASS: ${item.class}`);
    console.log(`     TEXT:  ${item.text}`);
  });

  await browser.close();
}

inspectLider();
