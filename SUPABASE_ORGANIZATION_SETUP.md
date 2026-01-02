# Supabase Organization Tables Setup

This guide will help you create the required database tables in Supabase for the Organization Management system.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one if needed)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the SQL Script

1. Open the file `supabase-organization-setup.sql` from this project
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

## Step 3: Verify Tables Were Created

After running the SQL, verify that the tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see two new tables:
   - `users` - For user authentication
   - `members` - For organization members

## Tables Created

### 1. `users` Table
Stores user login credentials and their assigned bhag_code.

**Fields:**
- `id` - Primary key (auto-increment)
- `username` - Unique username
- `password` - User password
- `bhag_code` - Assigned bhag/area code
- `created_at` - Timestamp

### 2. `members` Table
Stores member registration data.

**Fields:**
- `id` - Primary key (auto-increment)
- `member_id` - Unique member identifier
- `reg_date` - Registration date
- `first_name` - First name
- `last_name` - Last name
- `gender` - Gender
- `address` - Address
- `city` - City
- `bhag_code` - BHAG code (assigned by admin)
- `email` - Email address
- `phone` - Phone number
- `age` - Age
- `occupation` - Occupation
- `remark` - Remarks/notes
- `nagar_code` - Nagar code (can be added by users)
- `basti_code` - Basti code (can be added by users)
- `activation` - Activation status (default: 'Pending')
- `activation_dt` - Activation date/time
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Test Data

The SQL script includes test data:
- **Test User:** 
  - Username: `admin_b01`
  - Password: `password123`
  - BHAG Code: `B01`

- **Test Member:**
  - Member ID: `M101`
  - Name: John Doe
  - BHAG Code: `B01`
  - Activation: Pending

## Important Notes

1. **Security:** The current setup uses public access policies. For production, you should:
   - Implement proper authentication
   - Use Row Level Security (RLS) policies to restrict access
   - Hash passwords instead of storing them in plain text

2. **Password Storage:** Currently passwords are stored in plain text. For production, use password hashing (bcrypt, argon2, etc.)

3. **RLS Policies:** The tables have RLS enabled but with public access policies. Adjust these based on your security requirements.

## Troubleshooting

**Error: "relation already exists"**
- The tables already exist. You can either:
  - Drop the existing tables first (be careful - this deletes data!)
  - Or skip this step if tables are already created

**Error: "permission denied"**
- Make sure you're logged into Supabase with the correct account
- Check that you have the necessary permissions for the project

**Tables not showing in Table Editor**
- Refresh the page
- Check if there were any errors in the SQL execution
- Look at the SQL Editor output for error messages

## Next Steps

After creating the tables:

1. Test the API endpoints (see `API_DOCUMENTATION.md`)
2. Create additional users as needed
3. Start adding members via the API
4. Update security policies for production use


