-- Create maity schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS maity;

-- Create companies table
CREATE TABLE IF NOT EXISTS maity.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS maity.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  company_id UUID REFERENCES maity.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE maity.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Anyone can view active companies" ON maity.companies
  FOR SELECT USING (active = true);

-- Create RLS policies for users
CREATE POLICY "Users can view own data" ON maity.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON maity.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON maity.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Insert a test company
INSERT INTO maity.companies (id, name, active) 
VALUES ('9368d119-ec44-4d9a-a94f-b1a4bff39d6d', 'Test Company', true)
ON CONFLICT (id) DO NOTHING;
