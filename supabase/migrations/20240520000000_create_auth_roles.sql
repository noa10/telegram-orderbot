-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('user', 'Regular user with basic access'),
  ('merchant', 'Merchant with access to their own store'),
  ('admin', 'Administrator with full access');

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Add RLS policies for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Only admins can modify roles
CREATE POLICY "Admins can do all operations on roles" ON public.roles
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Everyone can view roles
CREATE POLICY "Everyone can view roles" ON public.roles
  FOR SELECT USING (true);

-- Add RLS policies for user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can assign roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Add function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get user's roles
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE (role_name TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT r.name FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
