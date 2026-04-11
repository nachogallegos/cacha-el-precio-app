const puppeteer = require('puppeteer');

async function testSelectors() {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] 
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  
  const url = 'https://www.lider.cl/supermercado/search?query=leche';
  console.log(`[🔎] Testeando Lider: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));

  const data = await page.evaluate(() => {
    const results = [];
    // Buscar contenedores que tengan botones de "Agregar"
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Agregar'));
    
    buttons.forEach(btn => {
      // Subir al contenedor del producto
      const card = btn.closest('[class*="flex-column"]');
      if (card) {
        const text = card.innerText;
        results.push({
          fullText: text.split('\n').filter(t => t.trim()).join(' | '),
          ariaLabel: btn.getAttribute('aria-label') || 'no label'
        });
      }
    });
    return results;
  });

  console.log(`\nEncontrados ${data.length} posibles productos.`);
  data.slice(0, 5).forEach((d, i) => console.log(`[${i+1}] ${d.ariaLabel}\n    ${d.fullText}`));

  await browser.close();
}

testSelectors();
