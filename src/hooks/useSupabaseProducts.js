import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

// Genera imagen placeholder con el nombre del producto usando ui-avatars
const makePlaceholder = (name = 'Producto', brand = '') => {
  const initials = (brand + ' ' + name).substring(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.substring(0, 20))}&background=FDF8F8&color=E5484D&size=200&bold=true&font-size=0.28`;
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
        // Si no hay imagen del scraper, usar placeholder elegante
        image: p.image_url || makePlaceholder(p.name, p.brand),
        source: null, // Solo para assets locales, no aplica a Supabase
        prices: (p.prices || []).map(pr => ({
          supermarketId: pr.supermarket_id,  // Ej: 'jumbo', 'lider'
          price: pr.price,
          stock: true,  // Todo lo que está en BD se considera en stock
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
        image: p.image_url || makePlaceholder(p.name, p.brand),
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
