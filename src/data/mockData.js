export const supermarkets = [
  { id: 'lider',       name: 'Líder',        color: '#005CE6', logoUrl: 'https://www.google.com/s2/favicons?domain=lider.cl&sz=128' },
  { id: 'jumbo',       name: 'Jumbo',        color: '#00B238', logoUrl: 'https://www.google.com/s2/favicons?domain=jumbo.cl&sz=128' },
  { id: 'santaisabel', name: 'Santa Isabel', color: '#E4002B', logoUrl: 'https://www.google.com/s2/favicons?domain=santaisabel.cl&sz=128' },
  { id: 'unimarc',     name: 'Unimarc',      color: '#DA291C', logoUrl: 'https://www.google.com/s2/favicons?domain=unimarc.cl&sz=128' },
];

const generatePrices = (basePrice) => {
  return [
    { supermarketId: 'lider',       price: Math.round(basePrice * (0.9  + Math.random() * 0.2)  / 10) * 10, stock: true },
    { supermarketId: 'jumbo',       price: Math.round(basePrice * (0.95 + Math.random() * 0.25) / 10) * 10, stock: true },
    { supermarketId: 'santaisabel', price: Math.round(basePrice * (0.92 + Math.random() * 0.22) / 10) * 10, stock: Math.random() > 0.1 },
    { supermarketId: 'unimarc',     price: Math.round(basePrice * (0.93 + Math.random() * 0.2)  / 10) * 10, stock: true },
  ];
};

export const fullProductsDatabase = [
  { id: 'p1', name: 'Pan Molde Blanco 500g', brand: 'Ideal', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Pan+Molde', prices: generatePrices(1800) },
  { id: 'p2', name: 'Leche Entera 1L', brand: 'Soprole', category: 'Lácteos', image: 'require("../../assets/leche_soprole.png")', prices: generatePrices(1050) },
  { id: 'p3', name: 'Arroz Grado 1 1Kg', brand: 'Tucapel', category: 'Despensa', image: 'require("../../assets/arroz_tucapel.png")', prices: generatePrices(1500) },
  { id: 'p4', name: 'Aceite Maravilla 1L', brand: 'Chef', category: 'Despensa', image: 'require("../../assets/aceite_chef.png")', prices: generatePrices(2200) },
  { id: 'p5', name: 'Bebida Coca-Cola Original 2L', brand: 'Coca-Cola', category: 'Bebidas', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Coca+Cola', prices: generatePrices(2100) },
  { id: 'p6', name: 'Papel Higiénico 25m', brand: 'Confort', category: 'Limpieza', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Papel+Confort', prices: generatePrices(6500) },
  { id: 'p7', name: 'Detergente Líquido 3L', brand: 'Omo', category: 'Limpieza', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Omo', prices: generatePrices(9990) },
  { id: 'p8', name: 'Fideos Spaghetti 400g', brand: 'Carozzi', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Fideos+Carozzi', prices: generatePrices(850) },
  { id: 'p9', name: 'Azúcar Granulada 1Kg', brand: 'Iansa', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Azucar+Iansa', prices: generatePrices(1200) },
  { id: 'p10', name: 'Huevos Blancos Selección x12', brand: 'Selección', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Huevos', prices: generatePrices(2800) },
  { id: 'p11', name: 'Mantequilla con Sal 250g', brand: 'Soprole', category: 'Lácteos', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Mantequilla', prices: generatePrices(2400) },
  { id: 'p12', name: 'Queso Gauda Laminado 250g', brand: 'Colun', category: 'Lácteos', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Queso+Colun', prices: generatePrices(2990) },
  { id: 'p13', name: 'Sal Yodada 1Kg', brand: 'Lobos', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Sal+Lobos', prices: generatePrices(550) },
  { id: 'p14', name: 'Ketchup 400g', brand: 'Hellmanns', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Ketchup', prices: generatePrices(1800) },
  { id: 'p15', name: 'Mayonesa 850g', brand: 'Kraft', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Mayonesa', prices: generatePrices(3990) },
  { id: 'p16', name: 'Café Tradición 100g', brand: 'Nescafé', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Nescafe', prices: generatePrices(3200) },
  { id: 'p17', name: 'Té Ceylán 100 bol.', brand: 'Supremo', category: 'Despensa', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Te+Supremo', prices: generatePrices(2500) },
  { id: 'p18', name: 'Jugo en Polvo Naranja', brand: 'Zuko', category: 'Bebidas', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Zuko', prices: generatePrices(300) },
  { id: 'p19', name: 'Bebida 1.5L', brand: 'Pepsi', category: 'Bebidas', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Pepsi', prices: generatePrices(1500) },
  { id: 'p20', name: 'Cerveza Lata 355cc', brand: 'Heineken', category: 'Bebidas', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Heineken', prices: generatePrices(850) },
  { id: 'p21', name: 'Vino Cabernet Sauvignon 1.5L', brand: 'Gato', category: 'Bebidas', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Vino+Gato', prices: generatePrices(3200) },
  { id: 'p22', name: 'Pechuga Pollo Deshuesada 1Kg', brand: 'SuperPollo', category: 'Carnes', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Pollo', prices: generatePrices(6500) },
  { id: 'p23', name: 'Carne Molida Vacuno 500g', brand: 'Carnes', category: 'Carnes', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Carne+Molida', prices: generatePrices(4500) },
  { id: 'p24', name: 'Salchichas Tradicional 20 un.', brand: 'San Jorge', category: 'Carnes', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Salchichas', prices: generatePrices(3800) },
  { id: 'p25', name: 'Manzana Royal Gala 1Kg', brand: 'Granel', category: 'Verdulería', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Manzanas', prices: generatePrices(1200) },
  { id: 'p26', name: 'Palta Hass 1Kg', brand: 'Granel', category: 'Verdulería', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Palta', prices: generatePrices(4990) },
  { id: 'p27', name: 'Tomate Larga Vida 1Kg', brand: 'Granel', category: 'Verdulería', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Tomates', prices: generatePrices(1500) },
  { id: 'p28', name: 'Limpiavidrios 500ml', brand: 'Cif', category: 'Limpieza', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Cif', prices: generatePrices(2100) },
  { id: 'p29', name: 'Lavaloza Limón 500ml', brand: 'Quix', category: 'Limpieza', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Quix', prices: generatePrices(1800) },
  { id: 'p30', name: 'Cloro Tradicional 1L', brand: 'Clorox', category: 'Limpieza', image: 'https://dummyimage.com/300x300/F1F5F9/1E3A8A.png?text=Cloro', prices: generatePrices(1200) },
];

// Re-vincular los locales al runtime en su propiedad source en vez de string
fullProductsDatabase[1].source = require('../../assets/leche_soprole.png');
fullProductsDatabase[2].source = require('../../assets/arroz_tucapel.png');
fullProductsDatabase[3].source = require('../../assets/aceite_chef.png');

export const dailyOffers = [
  { ...fullProductsDatabase[3], discountPrice: 1990, supermarketId: '1' },
  { ...fullProductsDatabase[1], discountPrice: 990, supermarketId: '2' },
  { ...fullProductsDatabase[2], discountPrice: 1490, supermarketId: '4' }
];

export const mockSearchResults = fullProductsDatabase[1].prices; // just fallback

export const myListMock = [
  { id: '201', name: 'Pan Molde Ideal', quantity: 1, bestPrice: 1800 },
  { id: '202', name: 'Huevos de Gallina Libre x12', quantity: 2, bestPrice: 2500 },
  { id: '203', name: 'Mantequilla Soprole 250g', quantity: 1, bestPrice: 2100 },
];

export const alertsMock = [
  { id: '301', name: 'Aceite Vegetal Belmont', targetPrice: 2000, currentBestPrice: 2100, active: true, triggered: false },
  { id: '302', name: 'Papel Higiénico Confort', targetPrice: 8500, currentBestPrice: 8200, active: true, triggered: true },
  { id: '303', name: 'Café Nescafé', targetPrice: 4000, currentBestPrice: 4500, active: false, triggered: false },
];

export const recentSearches = ['Pollo', 'Galletas Tritón', 'Pisco', 'Detergente'];
