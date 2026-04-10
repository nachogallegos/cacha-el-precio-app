-- =========================================================================
-- ESQUEMA MAESTRO DE BASE DE DATOS - CACHA EL PRECIO (SUPABASE)
-- =========================================================================

-- 1. Tabla de Usuarios (Extensión del sistema de Login de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar seguridad (RLS) para que un usuario solo vea su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tabla de Supermercados
CREATE TABLE public.supermarkets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_color TEXT
);

-- Insertar los supermercados fundadores
INSERT INTO public.supermarkets (id, name, logo_url, brand_color) VALUES 
('jumbo', 'Jumbo', 'https://www.google.com/s2/favicons?sz=64&domain=jumbo.cl', '#00B238'),
('lider', 'Líder', 'https://www.google.com/s2/favicons?sz=64&domain=lider.cl', '#0070CC'),
('unimarc', 'Unimarc', 'https://www.google.com/s2/favicons?sz=64&domain=unimarc.cl', '#DA291C'),
('santaisabel', 'Santa Isabel', 'https://www.google.com/s2/favicons?sz=64&domain=santaisabel.cl', '#E4002B');

-- 3. Catálogo Universal de Productos (Basado en Código de Barras EAN)
CREATE TABLE public.products (
  ean TEXT PRIMARY KEY,           -- El código de barras será nuestra Llave Maestra
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Historial y Motor de Precios
CREATE TABLE public.prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ean TEXT REFERENCES public.products(ean) ON DELETE CASCADE,
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,         -- Precio actual extraído por el bot
  normal_price NUMERIC,           -- Precio regular (sin descuento)
  formatted_unit TEXT,            -- Ejemplo: "$1.250 x lt"
  date_recorded DATE DEFAULT CURRENT_DATE, -- Para crear gráficos de cómo cambia según el día!
  
  -- Aseguramos que un supermercado no registre el mismo precio exacto dos veces el mismo día
  UNIQUE(ean, supermarket_id, date_recorded)
);

-- Vistas y Filtros públicos
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog is public" ON supermarkets FOR SELECT USING (true);
CREATE POLICY "Products are public" ON products FOR SELECT USING (true);
CREATE POLICY "Prices are public" ON prices FOR SELECT USING (true);
