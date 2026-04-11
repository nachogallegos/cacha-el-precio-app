const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zdabmithbzyehzcjvjek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYWJtaXRoYnp5ZWh6Y2p2amVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDYwNTcsImV4cCI6MjA5MTQyMjA1N30.p_fZBoI9Zq5agbCzxCE3cl2NBZSvMyVYNyQUp7sKu4k'
);

async function checkImage() {
  const { data } = await supabase
    .from('products')
    .select('ean, name, image_url')
    .ilike('name', '%nido%800%');

  console.log('\n=== IMAGEN NIDO 800g EN SUPABASE ===');
  data.forEach(p => {
    console.log(`Nombre    : ${p.name}`);
    console.log(`EAN       : ${p.ean}`);
    console.log(`image_url : ${p.image_url || '(VACÍO / NULL)'}`);
    console.log('---');
  });
}

checkImage();
