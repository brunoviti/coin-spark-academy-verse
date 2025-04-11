
-- This is a SQL migration file for Supabase
-- It creates a trigger to automatically create a profile when a user signs up

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_auth()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the user_role type exists and is valid
  -- Use a more defensive approach when casting the role
  INSERT INTO public.profiles (id, name, role, avatar_url, coins)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'New User'), 
    CASE 
      WHEN (new.raw_user_meta_data->>'role') IN ('student', 'teacher', 'admin', 'super_admin') 
      THEN (new.raw_user_meta_data->>'role')::user_role 
      ELSE 'student'::user_role 
    END,
    null, 
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the entire transaction
    RAISE WARNING 'Error creating profile: %', SQLERRM;
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
