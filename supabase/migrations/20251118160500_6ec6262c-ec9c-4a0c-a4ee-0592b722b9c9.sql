-- Fix RLS policy for user_roles to allow proper role insertion
-- Drop existing policy and recreate with proper permissions
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Allow admins to insert roles for any user
-- This policy checks if the CURRENT user (admin) has admin role, not the target user
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    -- Allow if current user is admin
    has_role(auth.uid(), 'admin'::app_role)
  );