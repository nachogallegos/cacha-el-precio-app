const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function saveToSupabase(products) {
  let saved = 0;
  let errors = 0;
  console.log(`[4/4] ☁️  Guardando ${products.length} productos en Supabase...`);

  for (const p of products) {
    const { error: productError } = await supabase
      .from('products')
      .upsert({
        ean: p.ean,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image_url: p.image_url,
        last_updated: new Date().toISOString()
      }, { onConflict: 'ean' });

    if (productError) { errors++; continue; }

    const { error: priceError } = await supabase
      .from('prices')
      .upsert({
        ean: p.ean,
        supermarket_id: p.supermarket_id,
        price: p.price,
        formatted_unit: p.formatted_unit,
        date_recorded: new Date().toISOString().split('T')[0],
      }, { onConflict: 'ean,supermarket_id,date_recorded' });

    if (priceError) { errors++; } else { saved++; }
  }
  return { saved, errors };
}

async function scrapeLider(query, category = 'Lácteos') {
  const supermarketId = 'lider';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  🤖 CACHA EL PRECIO - BOT DE EXTRACCIÓN (LIDER)`);
  console.log(`  Categoría    : ${category}`);
  console.log(`  Búsqueda     : "${query}"`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await puppeteer.launch({
    headless: 'shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

  // Lider.cl a veces bloquea si el viewport es pequeño
  await page.setViewport({ width: 1920, height: 1080 });

  const url = `https://www.lider.cl/supermercado/search?query=${encodeURIComponent(query)}`;
  console.log(`[1/4] 🌐 Conectando a Lider...`);

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    // Espera fija para asegurar que el JS inicial corra
    await new Promise(r => setTimeout(r, 6000));
  } catch (e) {
    console.log('[WARN] Error de carga inicial. Intentando continuar...');
  }

  console.log(`[2/4] ✅ Página abierta. Realizando scroll profundo...`);

  // Scroll agresivo para forzar renderizado de la grilla
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        // Scroll hasta 15000px o fin
        if (totalHeight >= document.body.scrollHeight || totalHeight > 15000) {
          clearInterval(timer);
          resolve();
        }
      }, 400);
    });
  });

  await new Promise(r => setTimeout(r, 3000));
  console.log(`[3/4] 🧹 Extrayendo datos de la grilla...`);

  const products = await page.evaluate((smId, cat, q) => {
    const results = [];
    
    // Buscar todas las tarjetas de producto por data-testid (muy estable en Walmart/Lider)
    const cards = document.querySelectorAll('div[data-testid="product-card"]');
    
    cards.forEach(card => {
      try {
        const titleEl = card.querySelector('[data-testid="product-title"]');
        const priceEl = card.querySelector('[data-testid="product-price"]');
        const brandEl = card.querySelector('[data-testid="product-brand"]');
        const imgEl = card.querySelector('img[data-testid="product-image"]');
        
        if (!titleEl || !priceEl) return;

        const name = titleEl.innerText.trim();
        const brand = brandEl ? brandEl.innerText.trim() : 'Genérico';
        
        // Limpiamos precio: "$ 1.250" -> 1250
        const price = parseInt(priceEl.innerText.replace(/\$|\.|/g, '').replace(/\s/g, '').trim(), 10);
        
        const imgUrl = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;

        if (isNaN(price)) return;

        // Filtro de relevancia básica
        const lowerQ = q.toLowerCase();
        if (!name.toLowerCase().includes(lowerQ) && !brand.toLowerCase().includes(lowerQ)) return;

        results.push({
          name: name,
          brand: brand,
          price: price,
          image_url: imgUrl,
          supermarket_id: smId,
          category: cat,
          formatted_unit: null
        });
      } catch (e) {}
    });
    
    return results;
  }, supermarketId, category, query);

  await browser.close();

  // Generar EAN unificado
  const structured = products.map(p => ({
    ...p,
    ean: 'EAN_' + p.name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9_]/g, '_')
      .substring(0, 30)
  }));

  console.log(`       → ${structured.length} productos identificados en Lider`);

  if (structured.length === 0) {
    console.log('❌ No se encontraron productos. Lider podría estar bloqueando el bot o los selectores cambiaron.');
    return;
  }

  const { saved, errors } = await saveToSupabase(structured);
  console.log(`  ✅ Misión parcial completada: ${saved} guardados.`);
}

async function runAll() {
  await scrapeLider('leche', 'Lácteos');
  await scrapeLider('arroz', 'Despensa');
  await scrapeLider('carne molida', 'Carnes');
  await scrapeLider('jamon', 'Fiambrería');
  await scrapeLider('shampoo', 'Aseo Personal');
  await scrapeLider('detergente', 'Aseo Hogar');
  await scrapeLider('comida perro', 'Mascotas');
  await scrapeLider('coca cola', 'Bebidas');
  await scrapeLider('manzana', 'Frutas y Verduras');
  await scrapeLider('papas fritas', 'Snacks');
  console.log('\n🌟 TODO LIDER LISTO');
}

runAll();
