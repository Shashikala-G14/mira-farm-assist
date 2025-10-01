-- Create enum for animal type
CREATE TYPE animal_type AS ENUM ('pig', 'poultry');

-- Create enum for animal gender
CREATE TYPE animal_gender AS ENUM ('male', 'female');

-- Create enum for health status
CREATE TYPE health_status AS ENUM ('healthy', 'sick', 'quarantined', 'deceased');

-- Create animals table
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type animal_type NOT NULL,
  gender animal_gender NOT NULL,
  birth_date DATE NOT NULL,
  health_status health_status NOT NULL DEFAULT 'healthy',
  is_vaccinated BOOLEAN DEFAULT FALSE,
  vaccination_date DATE,
  is_pregnant BOOLEAN DEFAULT FALSE,
  pregnancy_start_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_animals_farmer_id ON animals(farmer_id);
CREATE INDEX idx_animals_type ON animals(type);
CREATE INDEX idx_animals_health_status ON animals(health_status);

-- Enable RLS
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own animals
CREATE POLICY "Farmers can view their own animals"
ON animals FOR SELECT
USING (auth.uid() = farmer_id);

-- Farmers can insert their own animals
CREATE POLICY "Farmers can insert their own animals"
ON animals FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

-- Farmers can update their own animals
CREATE POLICY "Farmers can update their own animals"
ON animals FOR UPDATE
USING (auth.uid() = farmer_id);

-- Farmers can delete their own animals
CREATE POLICY "Farmers can delete their own animals"
ON animals FOR DELETE
USING (auth.uid() = farmer_id);

-- Policymakers can view all animals
CREATE POLICY "Policymakers can view all animals"
ON animals FOR SELECT
USING (has_role(auth.uid(), 'policymaker'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_animals_updated_at
BEFORE UPDATE ON animals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create educational resources table
CREATE TABLE educational_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'video', 'guide')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for educational resources
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view educational resources
CREATE POLICY "Everyone can view educational resources"
ON educational_resources FOR SELECT
USING (true);

-- Policymakers can create educational resources
CREATE POLICY "Policymakers can create educational resources"
ON educational_resources FOR INSERT
WITH CHECK (has_role(auth.uid(), 'policymaker'::app_role));

-- Policymakers can update educational resources
CREATE POLICY "Policymakers can update educational resources"
ON educational_resources FOR UPDATE
USING (has_role(auth.uid(), 'policymaker'::app_role));

-- Policymakers can delete educational resources
CREATE POLICY "Policymakers can delete educational resources"
ON educational_resources FOR DELETE
USING (has_role(auth.uid(), 'policymaker'::app_role));

-- Add trigger for educational resources updated_at
CREATE TRIGGER update_educational_resources_updated_at
BEFORE UPDATE ON educational_resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add guest role to app_role enum
ALTER TYPE app_role ADD VALUE 'guest';