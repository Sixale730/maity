-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  registration_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Platform admins can view all organizations" 
ON public.organizations 
FOR SELECT 
USING (get_user_role() = 'platform_admin'::app_role);

CREATE POLICY "Platform admins can insert organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (get_user_role() = 'platform_admin'::app_role);

CREATE POLICY "Platform admins can update organizations" 
ON public.organizations 
FOR UPDATE 
USING (get_user_role() = 'platform_admin'::app_role);

CREATE POLICY "Platform admins can delete organizations" 
ON public.organizations 
FOR DELETE 
USING (get_user_role() = 'platform_admin'::app_role);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_organizations_updated_at();