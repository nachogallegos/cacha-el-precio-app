const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function simulateCompetitors() {
  console.log('--- GENERANDO COMPARATIVAS FALSAS PERO REALISTAS PARA TODOS LOS PRODUCTOS ---');
  
  const { data: prices, error } = await supabase.from('prices').select('*');
  if (error) { console.error(error); return; }

  const eanMap = {};
  prices.forEach(p => {
    if (!eanMap[p.ean]) eanMap[p.ean] = [];
    eanMap[p.ean].push(p.supermarket_id);
  });

  let simulatedCount = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const p of prices) {
    // Si este EAN ya tiene más de 1 supermercado, omitir
    if (eanMap[p.ean].length > 1) continue;

    // Generar el rival inverso
    const missingCompetitor = p.supermarket_id === 'jumbo' ? 'lider' : 'jumbo';
    
    // Crear un precio similar (+/- 5%)
    const variation = 1 + ((Math.random() * 0.1) - 0.05); // entre 0.95 y 1.05
    const fakePrice = Math.round((p.price * variation) / 10) * 10;

    const { error: insertError } = await supabase.from('prices').upsert({
      ean: p.ean,
      supermarket_id: missingCompetitor,
      price: fakePrice,
      date_recorded: today,
    }, { onConflict: 'ean,supermarket_id,date_recorded' });

    if (!insertError) {
      simulatedCount++;
    }
  }

  console.log(`✅ ¡Misión completada! Se generaron ${simulatedCount} comparativas de la competencia.`);
}

simulateCompetitors();
