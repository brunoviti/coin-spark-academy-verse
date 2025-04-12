
-- Esta migración corrige la función handle_new_user_auth para manejar mejor los roles
-- y prevenir errores de base de datos al guardar nuevos usuarios

-- Primero eliminamos el trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Luego eliminamos la función existente
DROP FUNCTION IF EXISTS public.handle_new_user_auth();

-- Recreamos la función con manejo mejorado de errores y validación de roles
CREATE OR REPLACE FUNCTION public.handle_new_user_auth()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  valid_role user_role;
  user_name text;
  default_school_id uuid;
BEGIN
  -- Obtener el nombre del usuario o usar un valor predeterminado
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  
  -- Intentar obtener school_id del metadata o usar uno por defecto
  BEGIN
    -- Si hay school_id en metadata, usarlo
    IF new.raw_user_meta_data->>'school_id' IS NOT NULL THEN
      default_school_id := (new.raw_user_meta_data->>'school_id')::uuid;
    ELSE
      -- Si no hay escuelas aún, podemos crear una por defecto para desarrollo
      IF NOT EXISTS (SELECT 1 FROM public.schools LIMIT 1) THEN
        INSERT INTO public.schools (name, coin_name, coin_symbol, max_supply, current_supply) 
        VALUES ('Escuela por Defecto', 'EduCoin', 'EDC', 10000, 0)
        RETURNING id INTO default_school_id;
      ELSE
        -- Obtener el id de la primera escuela como valor por defecto
        SELECT id INTO default_school_id FROM public.schools LIMIT 1;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si hay algún problema obteniendo school_id, intentar con la primera escuela
    BEGIN
      SELECT id INTO default_school_id FROM public.schools LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      -- Si aún hay problemas, registrar y continuar (profile.school_id es nullable)
      RAISE WARNING 'No se pudo determinar school_id para el usuario %', new.id;
      default_school_id := NULL;
    END;
  END;
  
  -- Determinar el rol del usuario de manera segura
  BEGIN
    -- Intentar convertir directamente si el rol es válido
    IF new.raw_user_meta_data->>'role' IN ('student', 'teacher', 'admin', 'super_admin') THEN
      valid_role := (new.raw_user_meta_data->>'role')::user_role;
    ELSE
      -- Usar un valor predeterminado si el rol no es válido o no está presente
      valid_role := 'student'::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si hay algún problema con la conversión, usar el valor predeterminado
    valid_role := 'student'::user_role;
    RAISE NOTICE 'Error al convertir rol, usando student por defecto. Error: %', SQLERRM;
  END;

  -- Insertar en la tabla de perfiles con valores seguros
  INSERT INTO public.profiles (id, name, role, avatar_url, coins, updated_at, created_at, school_id)
  VALUES (
    new.id, 
    user_name, 
    valid_role,
    null, 
    0,
    now(),
    now(),
    default_school_id
  );
  
  RAISE NOTICE 'Usuario creado exitosamente: ID=%, Nombre=%, Rol=%, School_ID=%', 
              new.id, user_name, valid_role, default_school_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar el error de manera detallada pero continuar con la transacción
    RAISE WARNING 'Error creando perfil para usuario %: %. Detalles: %', 
                  new.id, SQLERRM, new.raw_user_meta_data;
    RAISE EXCEPTION 'Error al guardar usuario en la base de datos: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Recreamos el trigger para ejecutar la función después de crear un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auth();

-- Aseguramos que exista al menos una escuela por defecto
INSERT INTO public.schools (name, coin_name, coin_symbol, max_supply, current_supply)
SELECT 'Escuela por Defecto', 'EduCoin', 'EDC', 10000, 0
WHERE NOT EXISTS (SELECT 1 FROM public.schools LIMIT 1);
