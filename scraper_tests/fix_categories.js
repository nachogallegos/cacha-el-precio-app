const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function fixCategories() {
  console.log('--- REPARANDO CATEGORÍAS EN BASE DE DATOS ---');
  
  // Arroces
  const { error: e1 } = await supabase
    .from('products')
    .update({ category: 'Despensa' })
    .ilike('name', '%arroz%');
  if (!e1) console.log('✅ Arroz movido a Despensa');

  // Aceites
  const { error: e2 } = await supabase
    .from('products')
    .update({ category: 'Despensa' })
    .ilike('name', '%aceite%');
  if (!e2) console.log('✅ Aceite movido a Despensa');
  
  // Limpieza general a otros
  const { error: e3 } = await supabase
    .from('products')
    .update({ category: 'Lácteos' })
    .ilike('name', '%nido%');
  
  console.log('¡Categorías corregidas en tiempo real!');
}

fixCategories();
