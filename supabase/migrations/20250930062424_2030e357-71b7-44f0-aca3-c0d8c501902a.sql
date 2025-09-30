-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('farmer', 'policymaker');

-- Create enum for farm type
CREATE TYPE public.farm_type AS ENUM ('pig', 'poultry', 'both');

-- Create user_roles table first (needed for RLS policies)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  farm_type public.farm_type,
  farm_size DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Policymakers can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'policymaker'));

-- Create schemes/guidelines table
CREATE TABLE public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on schemes
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Schemes policies
CREATE POLICY "Everyone can view schemes"
ON public.schemes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Policymakers can create schemes"
ON public.schemes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'policymaker'));

CREATE POLICY "Policymakers can update schemes"
ON public.schemes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'policymaker'));

-- Create contact requests table
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Contact requests policies
CREATE POLICY "Farmers can view their own requests"
ON public.contact_requests FOR SELECT
TO authenticated
USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can create requests"
ON public.contact_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Policymakers can view all requests"
ON public.contact_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'policymaker'));

CREATE POLICY "Policymakers can update requests"
ON public.contact_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'policymaker'));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
BEFORE UPDATE ON public.schemes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  
  -- Assign farmer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'farmer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();