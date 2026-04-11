import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

// Placeholder confiable: usamos picsum con seed determinista por nombre
const makePlaceholder = (name = 'Producto') => {
  // Generamos un número seed basado en el texto del nombre
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed += name.charCodeAt(i);
  seed = (seed % 80) + 1; // Entre 1 y 80
  return `https://picsum.photos/seed/${seed}/200/200`;
};

// React Native NO renderiza SVGs — solo aceptamos jpg/png/webp
const getValidImage = (url, name) => {
  if (!url) return makePlaceholder(name);
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg') || lower.includes('.svg?')) return makePlaceholder(name);
  if (lower.startsWith('http')) return url;
  return makePlaceholder(name);
};

// Hook para buscar productos en Supabase con precios reales
export function useSupabaseProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          ean,
          name,
          brand,
          category,
          image_url,
          prices (
            price,
            formatted_unit,
            supermarket_id,
            date_recorded
          )
        `)
        .order('name');

      if (error) throw error;

      const formatted = data.map(p => ({
        id: p.ean,
        name: p.name,
        brand: p.brand || 'Sin marca',
        category: p.category || 'General',
        image: getValidImage(p.image_url, p.name),
        source: null,
        prices: (p.prices || []).map(pr => ({
          supermarketId: pr.supermarket_id,
          price: pr.price,
          stock: true,
          formattedUnit: pr.formatted_unit,
        })),
      }));

      setProducts(formatted);
    } catch (err) {
      console.log('[Supabase] Error cargando productos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda en tiempo real
  const searchProducts = async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('ean, name, brand, category, image_url, prices(price, supermarket_id)')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(8);

      if (error) throw error;

      return data.map(p => ({
        id: p.ean,
        name: p.name,
        brand: p.brand || 'Sin marca',
        category: p.category || 'General',
        image: getValidImage(p.image_url, p.name),
        source: null,
        prices: (p.prices || []).map(pr => ({
          supermarketId: pr.supermarket_id,
          price: pr.price,
          stock: true,
        })),
      }));
    } catch (err) {
      return [];
    }
  };

  return { products, loading, searchProducts, reload: loadProducts };
}
