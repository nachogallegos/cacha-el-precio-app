-- ============================================================
-- 🛡️ POLÍTICAS DE SEGURIDAD (RLS) PARA CACHA EL PRECIO
-- ============================================================
-- Instrucciones:
-- 1. Ve a app.supabase.com -> Tu Proyecto -> SQL Editor
-- 2. Pega todo este código y dale a "Run"
-- ============================================================

-- 1. Activar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas antiguas (por si acaso quedaron basuras)
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Public can read prices" ON prices;

-- 3. Políticas para PRODUCTOS y PRECIOS (Catálogo Público)
-- Permitir que cualquier persona navegue y busque los precios usando la App (Llave ANON)
CREATE POLICY "Public Read Access Products" 
  ON products FOR SELECT USING (true);

CREATE POLICY "Public Read Access Prices" 
  ON prices FOR SELECT USING (true);

-- NOTA IMPORTANTE PARA ESCRITURAS:
-- No hemos creado políticas de INSERT, UPDATE o DELETE para 'products' ni 'prices'.
-- Esto significa que nadie con la llave ANON puede borrarlos ni alterarlos.
-- Los Robots (GitHub Actions) usarán la Llave SERVICE_ROLE, la cual se salta el RLS nativamente.

-- 4. Políticas para PERFILES DE USUARIOS (Privacidad Básica)
-- Un usuario solo puede ver y editar su PROPIO nombre/zona, no el de los demás.
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- ✅ Fin de blindaje de base de datos.
-- ============================================================
