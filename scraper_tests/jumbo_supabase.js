const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// ============================================================
// CONEXIÓN A SUPABASE
// ============================================================
const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

// ============================================================
// PARSER: Convierte texto crudo en objeto estructurado
// ============================================================
function parseProductText(rawText, supermarketId, imageUrl = null) {
  // El scraper extrae texto así:
  // "$1.350 | $1.350 x lt | Colun | Leche Colun Entera 1 L | Agregar | 4.9"
  const parts = rawText.split(' | ').map(p => p.trim()).filter(p => p.length > 0);

  // Detectar textos que son PRECIOS PROMOCIONALES, no nombres (ej: "Lleva 2 por $2.050")
  const isPromoText = (s) =>
    s.includes('$') ||
    /^lleva \d/i.test(s) ||
    /^\d+ por \d/i.test(s) ||
    /^4 por/i.test(s) ||
    /^paga \$/i.test(s) ||
    /^pack \d/i.test(s);

  // Buscar precio principal (empieza con $ pero NO es un precio unitario)
  const pricePart = parts.find(p => p.startsWith('$') && !p.includes('x '));
  const unitPricePart = parts.find(p => p.includes('x '));

  // Limpiar precio: "$1.350" -> 1350
  const price = pricePart
    ? parseInt(pricePart.replace(/\$|\./g, '').trim(), 10)
    : null;

  // Buscar marca (1-3 palabras, sin $, corta, NO texto promo)
  const brand = parts.find(p =>
    !p.startsWith('$') &&
    !p.match(/^\d/) &&
    p !== 'Agregar' &&
    !isPromoText(p) &&
    !p.match(/producto/i) &&
    !p.match(/oferta/i) &&
    !p.match(/patrocinado/i) &&
    p.length < 25 &&
    parts.indexOf(p) > 1
  );

  // El nombre real: texto largo, sin $, no promo, no marca
  const name = parts.find(p =>
    !p.startsWith('$') &&
    p !== 'Agregar' &&
    p !== brand &&
    !p.match(/^\d/) &&
    !isPromoText(p) &&
    !p.match(/producto sin calificar/i) &&
    !p.match(/oferta/i) &&
    !p.match(/patrocinado/i) &&
    p.length > 8
  );

  if (!price || !name || isNaN(price) || price > 500000) return null;

  // EAN sin caracteres especiales
  const fakeEan = 'EAN_' + name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^A-Z0-9_]/g, '_')     // solo alfanumérico
    .substring(0, 30);

  return {
    ean: fakeEan,
    name: name.trim(),
    brand: brand ? brand.trim() : 'Desconocida',
    price: price,
    formatted_unit: unitPricePart || null,
    supermarket_id: supermarketId,
    category: 'Lácteos',
    image_url: imageUrl,  // URL real de Jumbo si la capturamos
  };
}

// ============================================================
// GUARDAR EN SUPABASE
// ============================================================
async function saveToSupabase(products) {
  let saved = 0;
  let errors = 0;

  for (const p of products) {
    // 1. Insertar o actualizar el producto en el catálogo maestro
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

    if (productError) { 
      errors++; 
      if (errors <= 2) console.log('  ERROR product:', JSON.stringify(productError));
      continue; 
    }

    // 2. Insertar el precio de hoy (ignorar si ya existe para hoy)
    const { error: priceError } = await supabase
      .from('prices')
      .upsert({
        ean: p.ean,
        supermarket_id: p.supermarket_id,
        price: p.price,
        formatted_unit: p.formatted_unit,
        date_recorded: new Date().toISOString().split('T')[0],
      }, { onConflict: 'ean,supermarket_id,date_recorded' });

    if (priceError) { 
      errors++; 
      if (errors <= 2) console.log('  ERROR price:', JSON.stringify(priceError));
    }
    else { saved++; }
  }

  return { saved, errors };
}

// ============================================================
// SCRAPER PRINCIPAL
// ============================================================
async function scrapeAndSave(query, supermarketId = 'jumbo') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  🤖 CACHA EL PRECIO - BOT DE EXTRACCIÓN`);
  console.log(`  Supermercado : ${supermarketId.toUpperCase()}`);
  console.log(`  Búsqueda     : "${query}"`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  const url = `https://www.jumbo.cl/busqueda?ft=${encodeURIComponent(query)}`;
  console.log(`[1/4] 🌐 Conectando a Jumbo...`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log(`[2/4] ✅ Página cargada. Extrayendo productos...`);

  const rawProducts = await page.evaluate(() => {
    let results = [];

    const cards = document.querySelectorAll(
      '[class*="plp_card"], [class*="border rounded-t-lg"], [class*="rounded-t-lg flex flex-col items-left"]'
    );

    cards.forEach(card => {
      const txt = card.innerText;
      if (txt && txt.includes('$') && txt.length < 400) {
        // Extraer imagen del tag <img> dentro de la tarjeta
        const img = card.querySelector('img');
        const imgUrl = img ? (img.src || img.dataset.src || null) : null;
        results.push({
          text: txt.split('\n').filter(t => t.trim() !== '').join(' | '),
          imageUrl: imgUrl,
        });
      }
    });

    return results;
  });

  await browser.close();
  console.log(`[3/4] 🧹 Procesando ${rawProducts.length} bloques extraídos...`);

  // Parsear cada bloque de texto en objeto estructurado
  const structured = rawProducts
    .map(raw => parseProductText(raw.text || raw, supermarketId, raw.imageUrl || null))
    .filter(p => p !== null);

  console.log(`       → ${structured.length} productos válidos identificados`);

  if (structured.length === 0) {
    console.log('\n❌ No se encontraron productos válidos para guardar.');
    return;
  }

  // Mostrar preview
  console.log('\n--- PREVIEW (primeros 3 productos) ---');
  structured.slice(0, 3).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
    console.log(`     Marca: ${p.brand} | Precio: $${p.price.toLocaleString('es-CL')}`);
    console.log(`     EAN: ${p.ean}`);
  });
  console.log('--------------------------------------\n');

  console.log(`[4/4] ☁️  Guardando en Supabase...`);
  const { saved, errors } = await saveToSupabase(structured);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ✅ MISIÓN COMPLETADA`);
  console.log(`  Productos guardados : ${saved}`);
  console.log(`  Errores             : ${errors}`);
  console.log(`  Revisa tu panel Supabase → Table Editor → products/prices`);
  console.log(`${'='.repeat(60)}\n`);
}

// ============================================================
// EJECUCIÓN
// ============================================================
scrapeAndSave('leche');
