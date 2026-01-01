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
-- Fields: Memberid, Date, First Name, Last Name, Gender, Address, City, BHAG, Email, Phone, Age, Occupation, Activation, Activation Dt, Remark
-- BHAG is assigned by admin. Users can add nagar_code and basti_code.
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(20) UNIQUE,              -- Memberid: Unique member identifier
  reg_date VARCHAR(20),                      -- Date: Registration date
  first_name VARCHAR(50),                    -- First Name
  last_name VARCHAR(50),                     -- Last Name
  gender VARCHAR(10),                        -- Gender
  address TEXT,                              -- Address
  city VARCHAR(50),                          -- City
  bhag_code VARCHAR(50),                     -- BHAG: Area code assigned by admin
  email VARCHAR(100),                        -- Email
  phone VARCHAR(20),                         -- Phone
  age INTEGER,                               -- Age
  occupation VARCHAR(100),                   -- Occupation
  remark TEXT,                               -- Remark
  
  -- User-Updated Fields (users can add/update these)
  nagar_code VARCHAR(50),                    -- Nagar Code: Can be added by users
  basti_code VARCHAR(50),                    -- Basti Code: Can be added by users
  activation VARCHAR(20) DEFAULT 'Pending',  -- Activation: Status (Pending, Contacted, etc.)
  activation_dt VARCHAR(20),                 -- Activation Dt: Activation date/time
  
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

