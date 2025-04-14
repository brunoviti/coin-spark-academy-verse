
-- Este archivo es una referencia para configurar las políticas de seguridad (RLS) en Supabase

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Función auxiliar para obtener la escuela del usuario actual
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Los profesores pueden ver perfiles de estudiantes de su escuela"
ON public.profiles
FOR SELECT
USING (
  (get_user_role() IN ('teacher', 'admin', 'super_admin'))
  AND (school_id = get_user_school_id())
);

CREATE POLICY "Super administradores pueden ver todos los perfiles"
ON public.profiles
FOR SELECT
USING (get_user_role() = 'super_admin');

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Políticas para schools
CREATE POLICY "Todos pueden ver escuelas"
ON public.schools
FOR SELECT
USING (true);

CREATE POLICY "Solo administradores pueden crear escuelas"
ON public.schools
FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Solo administradores pueden actualizar escuelas"
ON public.schools
FOR UPDATE
USING (
  (get_user_role() IN ('admin', 'super_admin'))
  AND (id = get_user_school_id() OR get_user_role() = 'super_admin')
);

-- Políticas para classes
CREATE POLICY "Usuarios pueden ver clases de su escuela"
ON public.classes
FOR SELECT
USING (school_id = get_user_school_id());

CREATE POLICY "Profesores pueden crear clases"
ON public.classes
FOR INSERT
WITH CHECK (
  (get_user_role() IN ('teacher', 'admin', 'super_admin'))
  AND (school_id = get_user_school_id())
);

-- Políticas para achievement_types
CREATE POLICY "Usuarios pueden ver tipos de logros de su escuela"
ON public.achievement_types
FOR SELECT
USING (school_id = get_user_school_id());

CREATE POLICY "Profesores y administradores pueden crear tipos de logros"
ON public.achievement_types
FOR INSERT
WITH CHECK (
  (get_user_role() IN ('teacher', 'admin', 'super_admin'))
  AND (school_id = get_user_school_id())
);

-- Políticas para achievements
CREATE POLICY "Estudiantes pueden ver sus propios logros"
ON public.achievements
FOR SELECT
USING (
  (student_id = auth.uid())
  OR (get_user_role() IN ('teacher', 'admin', 'super_admin'))
);

CREATE POLICY "Profesores pueden crear logros"
ON public.achievements
FOR INSERT
WITH CHECK (get_user_role() IN ('teacher', 'admin', 'super_admin'));

-- Políticas para transactions
CREATE POLICY "Usuarios pueden ver sus propias transacciones"
ON public.transactions
FOR SELECT
USING (
  (sender_id = auth.uid())
  OR (receiver_id = auth.uid())
  OR (get_user_role() IN ('admin', 'super_admin'))
);

CREATE POLICY "Usuarios autorizados pueden crear transacciones"
ON public.transactions
FOR INSERT
WITH CHECK (get_user_role() IN ('teacher', 'admin', 'super_admin'));

-- Políticas para marketplace_items
CREATE POLICY "Todos pueden ver productos del mercado de su escuela"
ON public.marketplace_items
FOR SELECT
USING (school_id = get_user_school_id());

CREATE POLICY "Administradores pueden gestionar productos del mercado"
ON public.marketplace_items
FOR ALL
WITH CHECK (
  (get_user_role() IN ('admin', 'super_admin'))
  AND (school_id = get_user_school_id())
);

-- Políticas para marketplace_purchases
CREATE POLICY "Estudiantes pueden ver sus propias compras"
ON public.marketplace_purchases
FOR SELECT
USING (
  (student_id = auth.uid())
  OR (get_user_role() IN ('admin', 'super_admin'))
);

CREATE POLICY "Estudiantes pueden realizar compras"
ON public.marketplace_purchases
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Políticas para exchange_listings
CREATE POLICY "Todos pueden ver listados de intercambio de su escuela"
ON public.exchange_listings
FOR SELECT
USING (school_id = get_user_school_id());

CREATE POLICY "Usuarios pueden crear sus propios listados"
ON public.exchange_listings
FOR INSERT
WITH CHECK (
  (seller_id = auth.uid())
  AND (school_id = get_user_school_id())
);

CREATE POLICY "Usuarios pueden actualizar sus propios listados"
ON public.exchange_listings
FOR UPDATE
USING (seller_id = auth.uid());

-- Políticas para exchange_offers
CREATE POLICY "Usuarios pueden ver ofertas relevantes"
ON public.exchange_offers
FOR SELECT
USING (
  -- El comprador puede ver sus ofertas
  (buyer_id = auth.uid())
  -- El vendedor puede ver ofertas a sus listados
  OR EXISTS (
    SELECT 1 FROM public.exchange_listings
    WHERE id = exchange_offers.listing_id
    AND seller_id = auth.uid()
  )
  -- Administradores pueden ver todas las ofertas
  OR (get_user_role() IN ('admin', 'super_admin'))
);

CREATE POLICY "Usuarios pueden crear ofertas"
ON public.exchange_offers
FOR INSERT
WITH CHECK (buyer_id = auth.uid());
