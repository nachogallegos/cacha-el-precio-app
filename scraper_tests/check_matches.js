const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function checkMatches() { 
  const { data, error } = await supabase.from('prices').select('ean, supermarket_id'); 
  if (error) { console.error('Error fetching prices:', error); return; } 
  
  const eanCounts = {}; 
  data.forEach(item => { 
    if (!eanCounts[item.ean]) eanCounts[item.ean] = new Set(); 
    eanCounts[item.ean].add(item.supermarket_id); 
  }); 
  
  let matchCount = 0; 
  console.log('\n=== PRODUCTOS EN AMBOS SUPERMERCADOS ==='); 
  for (const [ean, smIds] of Object.entries(eanCounts)) { 
    if (smIds.size > 1) { 
      matchCount++; 
      console.log(ean, [...smIds]); 
    } 
  } 
  console.log(`\n Total de coincidencias (matches) encontradas: ${matchCount}`); 
} 

checkMatches();
