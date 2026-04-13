const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

const SUPERMARKET_ID = 'unimarc';

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

function generateEanFromName(name) {
  let clean = name.toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30);
  return 'EAN_' + clean;
}

function parseProductText(name, rawPrice, category) {
  const pStr = String(rawPrice).replace(/[$.]/g, '').trim();
  const price = parseInt(pStr);
  if (isNaN(price)) return null;

  return {
    ean: generateEanFromName(name),
    name: name,
    brand: 'Unimarc', // Fallback
    price: price,
    category: category,
    image_url: 'https://www.unimarc.cl/favicon.ico'
  };
}

async function scrapeUnimarc(query, category) {
  console.log(`\n============================================================`);
  console.log(`  🤖 CACHA EL PRECIO - BOT DE EXTRACCIÓN`);
  console.log(`  Supermercado : UNIMARC`);
  console.log(`  Categoría    : ${category}`);
  console.log(`  Búsqueda     : "${query}"`);
  console.log(`============================================================\n`);

  console.log(`[1/4] 🌐 Conectando a Unimarc...`);
  const browser = await puppeteer.launch({
    headless: 'shell',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    const searchUrl = `https://www.unimarc.cl/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log(`[2/4] ✅ Página cargada. Extrayendo productos...`);
    
    // Auto scroll para Unimarc
    let previousHeight = 0;
    while (true) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000));
        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) break;
    }

    const rawProducts = await page.evaluate(() => {
      // Intentar selectores de Unimarc genéricos o de Falabella (dependiendo el stack actual de SMU)
      const blocks = Array.from(document.querySelectorAll('[class*="Shelf"] [class*="ProductCard"], [data-testid="product-card"]'));
      
      return blocks.map(block => {
        const nameEl = block.querySelector('[class*="ProductName"], h2, h3, [class*="title"]');
        const priceEl = block.querySelector('[class*="TextPrice"], [class*="Price"], [class*="amount"]');
        if (!nameEl || !priceEl) return null;
        return {
          name: nameEl.innerText.trim(),
          price: priceEl.innerText.trim()
        };
      }).filter(Boolean);
    });

    console.log(`[3/4] 🧹 Procesando ${rawProducts.length} bloques extraídos...`);

    const products = [];
    for (const raw of rawProducts) {
      if (!raw.name || !raw.price) continue;
      const parsed = parseProductText(raw.name, raw.price, category);
      if (parsed) products.push(parsed);
    }

    console.log(`       → ${products.length} productos válidos listos para DB.`);

    if (products.length > 0) {
      console.log(`[4/4] ☁️  Guardando en Supabase...`);
      for (const p of products) {
        await supabase.from('products').upsert({
          ean: p.ean,
          name: p.name,
          brand: p.brand,
          category: p.category,
          image_url: p.image_url
        }, { onConflict: 'ean' });

        await supabase.from('prices').upsert({
          ean: p.ean,
          supermarket_id: SUPERMARKET_ID,
          price: p.price,
          normal_price: p.price,
          date_recorded: new Date().toISOString().split('T')[0]
        }, { onConflict: 'ean,supermarket_id,date_recorded' });
      }
      console.log(`✅ ¡Misión completada! Tarea de Unimarc finalizada.`);
    }

  } catch (err) {
    console.error(`❌ Error general: ${err.message}`);
  } finally {
    await browser.close();
  }
}

async function runAll() {
  await scrapeUnimarc('leche', 'Lácteos');
  // Se pueden añadir más búsquedas...
}

if (require.main === module) {
  runAll();
}
