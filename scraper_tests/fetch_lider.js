const https = require('https');

https.get('https://www.lider.cl/supermercado/search?query=leche', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    console.log("Total lines:", lines.length);
    const scriptLine = lines.find(l => l.includes('__NEXT_DATA__'));
    if (scriptLine) {
      console.log("FOUND __NEXT_DATA__! Snippet:", scriptLine.substring(0, 300));
      if (scriptLine.includes('sku') || scriptLine.includes('price')) {
         console.log("IT HAS PRODUCTS!");
      }
    } else {
      console.log("No NEXT DATA");
      console.log("Redirect?", res.statusCode, res.headers.location);
    }
  });
});
