-- Add password column to students and faculties tables for admin reference
-- Note: This stores passwords for admin to share with users. Consider password reset on first login for security.

ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS password TEXT;

-- Update RLS policies to ensure admins can insert user_roles when creating accounts
-- Drop and recreate the admin insert policy to be more explicit
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;

CREATE POLICY "Admins can insert roles" 
ON user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if current user is admin
  has_role(auth.uid(), 'admin'::app_role)
);