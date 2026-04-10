const axios = require('axios');

async function testJumboAPI(query) {
  try {
    // Las tiendas VTEX suelen tener la API pública expuesta en esta ruta:
    const url = `https://www.jumbo.cl/api/catalog_system/pub/products/search/${encodeURIComponent(query)}`;
    console.log(`\n[API SCRAPER] Infiltrańdose en las bóvedas de VTEX Jumbo...`);
    console.log(`[GET] ${url}`);
    
    // Fingimos ser un navegador simple para evitar bloqueos
    const response = await axios.get(url, {
      headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         'Accept': 'application/json, text/plain, */*'
      }
    });

    const data = response.data;

    if (data && data.length > 0) {
      console.log(`\n[BINGO] ¡Conexión con base de datos establecida! Se encontraron ${data.length} productos.`);
      
      // Analizar el primer producto
      const p = data[0];
      const item = p.items && p.items[0] ? p.items[0] : {};
      const seller = item.sellers && item.sellers[0] ? item.sellers[0] : {};
      const offer = seller.commertialOffer || {};
      
      console.log(`\n--- PRIMER PRODUCTO ENCONTRADO ---`);
      console.log(`🎯 ID Interno : ${p.productId}`);
      console.log(`🏷️  Nombre     : ${p.productName}`);
      console.log(`🏢 Marca      : ${p.brand}`);
      console.log(`💵 Precio     : $${offer.Price || 'No disponible'}`);
      console.log(`📷 Fotografía : ${item.images && item.images[0] ? item.images[0].imageUrl : 'Sin imagen'}`);
      console.log(`📊 Código EAN : ${item.ean || 'No reportado'}`);
      console.log(`----------------------------------\n`);
      
    } else {
        console.log("\n[VACÍO] API respondió pero no trajo productos o la ruta ha cambiado.");
    }

  } catch (error) {
    if (error.response) {
      console.log(`\n[BLOQUEO] Jumbo rechazó la conexión a la API. Código: ${error.response.status}`);
      // Jumbo puede restringir estas APIs públicas o pedir tokens específicos.
    } else {
      console.log("\n[ERROR DE RED] Error intentando contactar la API:", error.message);
    }
  }
}

testJumboAPI('leche');
