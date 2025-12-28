-- Create the contacts table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  contact_number TEXT,
  area TEXT,
  referred_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public access (no authentication required)
-- This allows anyone to read, insert, update, and delete contacts
CREATE POLICY "Allow public access" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);


