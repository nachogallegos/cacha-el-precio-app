const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function findAndFixNido() {
  console.log('\n[🔍] Buscando imagen Nido 800g en Jumbo...');
  
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

  // Buscar directamente "Nido 800"
  await page.goto('https://www.jumbo.cl/busqueda?ft=nido+leche+800g', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Scroll completo para cargar lazy images
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const timer = setInterval(() => { window.scrollBy(0, 300); total += 300; if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }}, 100);
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Buscar TODAS las imágenes de la página que sean de productos
  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs)
      .map(img => ({
        src: img.src || img.getAttribute('data-src') || img.getAttribute('srcset')?.split(' ')[0] || '',
        alt: img.alt || '',
        width: img.naturalWidth
      }))
      .filter(i => i.src && i.src.startsWith('http') && !i.src.endsWith('.svg') && i.src.includes('vtex') || i.src.includes('cencosud') || i.src.includes('jumbo'))
      .slice(0, 10);
  });

  await browser.close();

  console.log('\n=== IMÁGENES ENCONTRADAS ===');
  images.forEach((img, i) => {
    console.log(`[${i+1}] ${img.alt || '(sin alt)'}`);
    console.log(`     ${img.src.substring(0, 100)}`);
  });

  // Buscar la que probablemente sea Nido
  const nidoImg = images.find(i => 
    i.alt?.toLowerCase().includes('nido') || 
    i.src?.toLowerCase().includes('nido') ||
    i.alt?.toLowerCase().includes('800')
  );

  if (nidoImg) {
    console.log('\n✅ Imagen Nido encontrada:', nidoImg.src);
    const { error } = await supabase
      .from('products')
      .update({ image_url: nidoImg.src })
      .eq('ean', 'EAN_LECHE_POLVO_NIDO_ENTERA_800_G');
    if (!error) console.log('✅ Guardada en Supabase.');
    else console.log('❌ Error guardando:', error.message);
  } else {
    console.log('\n⚠️  No se encontró imagen específica de Nido. URLs generales mostradas arriba.');
  }
}

findAndFixNido();
