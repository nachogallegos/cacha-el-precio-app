const puppeteer = require('puppeteer');
const fs = require('fs');

async function inspectJumbo() {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });
  
  await page.goto('https://www.jumbo.cl/busqueda?ft=leche', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));

  // Capturar screenshot
  await page.screenshot({ path: 'jumbo_debug.png', fullPage: false });
  
  // Extraer las primeras clases únicas de los divs que contienen "$"
  const info = await page.evaluate(() => {
    const allEls = document.querySelectorAll('*');
    let classesWithPrice = new Set();
    let sampleTexts = [];
    
    allEls.forEach(el => {
      const txt = el.innerText || '';
      if (txt.includes('$') && txt.length < 300 && txt.length > 20 && el.className) {
        const cls = el.className.toString().substring(0, 80);
        if (!classesWithPrice.has(cls)) {
          classesWithPrice.add(cls);
          sampleTexts.push({ class: cls, text: txt.substring(0, 100) });
        }
      }
    });
    return sampleTexts.slice(0, 15);
  });
  
  await browser.close();
  
  console.log('\n=== CLASES CSS CON PRECIOS DETECTADAS ===');
  info.forEach((item, i) => {
    console.log(`\n[${i+1}] CLASS: ${item.class}`);
    console.log(`     TEXT:  ${item.text}`);
  });
}

inspectJumbo();
