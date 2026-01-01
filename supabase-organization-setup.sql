-- Create the organization management tables in Supabase
-- Run this SQL in your Supabase SQL Editor

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  bhag_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(20) UNIQUE,
  reg_date VARCHAR(20),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(50),
  bhag_code VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  age INTEGER,
  occupation VARCHAR(100),
  remark TEXT,
  
  -- User-Updated Fields
  nagar_code VARCHAR(50),
  basti_code VARCHAR(50),
  activation VARCHAR(20) DEFAULT 'Pending',
  activation_dt VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_bhag_code ON users(bhag_code);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_bhag_code ON members(bhag_code);
CREATE INDEX IF NOT EXISTS idx_members_activation ON members(activation);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow public access to users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for members table
CREATE POLICY "Allow public access to members" ON members
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert test data (optional - remove in production)
INSERT INTO users (username, password, bhag_code)
VALUES ('admin_b01', 'password123', 'B01')
ON CONFLICT (username) DO NOTHING;

INSERT INTO members (member_id, first_name, last_name, bhag_code, activation)
VALUES ('M101', 'John', 'Doe', 'B01', 'Pending')
ON CONFLICT (member_id) DO NOTHING;

