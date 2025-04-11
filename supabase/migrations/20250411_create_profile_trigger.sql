
-- This is a SQL migration file for Supabase
-- It creates a trigger to automatically create a profile when a user signs up

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_auth()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  valid_role user_role;
  user_name text;
BEGIN
  -- Obtener el nombre del usuario o usar un valor predeterminado
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  
  -- Determinar el rol del usuario de manera segura
  BEGIN
    -- Intentar convertir directamente si el rol es válido
    IF new.raw_user_meta_data->>'role' IN ('student', 'teacher', 'admin', 'super_admin') THEN
      valid_role := (new.raw_user_meta_data->>'role')::user_role;
    ELSE
      -- Usar un valor predeterminado si el rol no es válido
      valid_role := 'student'::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si hay algún problema con la conversión, usar el valor predeterminado
    valid_role := 'student'::user_role;
  END;

  -- Insertar en la tabla de perfiles con valores seguros
  INSERT INTO public.profiles (id, name, role, avatar_url, coins, updated_at)
  VALUES (
    new.id, 
    user_name, 
    valid_role,
    null, 
    0,
    now()
  );
  
  RAISE NOTICE 'Usuario creado exitosamente: ID=%, Nombre=%, Rol=%', new.id, user_name, valid_role;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar el error de manera detallada pero continuar con la transacción
    RAISE WARNING 'Error creando perfil para usuario %: %. Detalles: %', 
                  new.id, SQLERRM, new.raw_user_meta_data;
    RETURN NEW;
END;
$$;

-- Ensure the trigger doesn't already exist before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Create trigger to run after a user is created
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_auth();
  END IF;
END
$$;
