const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function injectMatches() {
  console.log('--- INYECTANDO MATCHES PERFECTOS PARA DEMO ---');
  const today = new Date().toISOString().split('T')[0];

  const products = [
    {
      ean: 'EAN_LECHE_COLUN_ENTERA_1_L_DEMO',
      name: 'Leche Colun Entera 1 L',
      brand: 'Colun',
      category: 'Lácteos',
      image_url: 'https://jumbocl.vteximg.com.br/arquivos/ids/601007/Leche-Colun-Entera-1-L.jpg',
      last_updated: new Date().toISOString()
    },
    {
      ean: 'EAN_LECHE_POLVO_NIDO_ENTERA_800_G_DEMO',
      name: 'Leche Polvo Nido Entera 800 g',
      brand: 'Nido',
      category: 'Lácteos',
      image_url: 'https://jumbocl.vteximg.com.br/arquivos/ids/458280/LECHE-POLVO-SEMIDE.jpg',
      last_updated: new Date().toISOString()
    }
  ];

  const prices = [
    // COLUN
    { ean: 'EAN_LECHE_COLUN_ENTERA_1_L_DEMO', supermarket_id: 'jumbo', price: 990, date_recorded: today },
    { ean: 'EAN_LECHE_COLUN_ENTERA_1_L_DEMO', supermarket_id: 'lider', price: 950, date_recorded: today },
    // NIDO
    { ean: 'EAN_LECHE_POLVO_NIDO_ENTERA_800_G_DEMO', supermarket_id: 'jumbo', price: 5990, date_recorded: today },
    { ean: 'EAN_LECHE_POLVO_NIDO_ENTERA_800_G_DEMO', supermarket_id: 'lider', price: 6200, date_recorded: today }
  ];

  // 1. Guardar productos
  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'ean' });
    if (error) console.error('Error insertando producto:', error);
    else console.log(`✅ Producto insertado: ${p.name}`);
  }

  // 2. Guardar precios cruzados
  for (const pr of prices) {
    const { error } = await supabase.from('prices').upsert(pr, { onConflict: 'ean,supermarket_id,date_recorded' });
    if (error) console.error('Error insertando precio:', error);
    else console.log(`✅ Precio insertado: ${pr.ean} en ${pr.supermarket_id} a $${pr.price}`);
  }

  console.log('¡Inyección de test completada!');
}

injectMatches();
