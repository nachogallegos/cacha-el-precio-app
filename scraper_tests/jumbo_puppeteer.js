const puppeteer = require('puppeteer');

async function scrapeJumbo(query) {
    console.log(`\n[PUPPETEER] Lanzando navegador espectro en modo oculto...`);
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    
    const url = `https://www.jumbo.cl/busqueda?ft=${encodeURIComponent(query)}`;
    console.log(`[PUPPETEER] Misión: Extraer precios para "${query}"`);
    console.log(`[PUPPETEER] Abriendo objetivo: ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log(`[PUPPETEER] Biframe cargado. Hackeando la memoria visual (Apollo State)...`);
        
        await new Promise(r => setTimeout(r, 4000));
        
        // Estrategia VTEX Avanzada: Acceder a la bóveda de la memoria de React (window.__STATE__)
        const databaseDump = await page.evaluate(() => {
            if (window.__STATE__) {
                return JSON.stringify(window.__STATE__);
            }
            return null;
        });

        if (databaseDump) {
            const data = JSON.parse(databaseDump);
            let productCount = 0;
            console.log(`\n[EXITO MASSIVO] ¡Explotamos la memoria de React de Jumbo!`);
            
            // Recorrer el laberinto de objetos de Apollo GraphQL buscando precios
            for (let key in data) {
                // VTEX guarda los productos con la clave "Product:"
                if (key.startsWith('Product:')) {
                    const item = data[key];
                    const productName = item.productName || item.brand;
                    // Buscar la llave que contenga "items" y "sellers"
                    // Como el volcado de memoria de VTEX es descentralizado, a veces los precios están ligados en otro objeto.
                    console.log(`\r\n🔍 PRODUCTO ENCONTRADO EN MEMORIA:`);
                    console.log(`   Nombre: ${productName}`);
                    console.log(`   Referencia ID: ${item.productId}`);
                    productCount++;
                    if(productCount >= 3) break; // Solo mostrar los primeros 3
                }
            }
            
            if(productCount === 0) console.log("La base no tenía objetos marcados como 'Product:'");

        } else {
             // Estrategia B: Extractor de DOM Visual Profundo
             console.log(`[VTEX NOT FOUND] Buscando elementos visuales clásicos...`);
             const cssExtraction = await page.evaluate(() => {
                 let results = [];
                 // Buscamos cualquier etiqueta que contenga el signo peso $ dentro de la grilla
                 const grids = document.querySelectorAll('div[class*="product-summary"], div[class*="shelf"]');
                 grids.forEach(g => {
                     const txt = g.innerText;
                     if(txt && txt.includes('$')) results.push(txt.split('\n').filter(t => t.trim() !== '').join(' | '));
                 });
                 return results;
             });
             
             if(cssExtraction.length > 0) {
                 console.log(`\n[EXITO RESTRINGIDO] Se extrajo mediante la vista (Óptico):`);
                 console.log(cssExtraction[0]);
                 console.log(cssExtraction[1]);
             } else {
                 console.log(`[FALLO TOTAL] Jumbo mutó completamente su página. Posible AB testing activo.`);
             }
        }

    } catch(e) {
        console.log("\n[ERROR PUPPETEER] Chocamos. El servidor cerró de golpe:", e.message);
    } finally {
        await browser.close();
    }
}

scrapeJumbo('leche');
