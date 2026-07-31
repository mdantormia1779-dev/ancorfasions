-- ============================================================
-- Supabase Trigger: Sync Profile Role → auth.users metadata
-- Run this SQL in your Supabase SQL Editor
-- This ensures the JWT always has the correct role.
-- ============================================================

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.sync_role_to_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_name TEXT;
BEGIN
  -- Get the role name from the roles table
  SELECT name INTO role_name
  FROM public.roles
  WHERE id = NEW.role_id;

  -- Update the user's metadata in auth.users
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(COALESCE(role_name, 'CUSTOMER'))
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_role_updated ON public.profiles;

CREATE TRIGGER on_profile_role_updated
  AFTER INSERT OR UPDATE OF role_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_auth_metadata();

-- ============================================================
-- Step 3: Run once to sync all existing profiles immediately
-- ============================================================
UPDATE public.profiles SET role_id = role_id WHERE role_id IS NOT NULL;

-- ============================================================
-- MANUAL: Promote specific user to SUPERADMIN
-- Replace the email below with your own email
-- ============================================================
/*
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'SUPERADMIN')
WHERE id = (SELECT id FROM auth.users WHERE email = 'dev.sazzadali@gmail.com');
*/
