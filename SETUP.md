# Supabase Setup Guide

Follow these steps to connect your Nexus app to Supabase:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be fully provisioned

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## 3. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the query

This will create the `contacts` table with the necessary structure.

## 4. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace:
- `your_supabase_project_url` with your Project URL from step 2
- `your_supabase_anon_key` with your anon public key from step 2

## 5. Install Dependencies

```bash
npm install
```

This will install the Supabase client library along with other dependencies.

## 6. Run the App

```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Troubleshooting

- **Connection errors**: Make sure your `.env.local` file has the correct Supabase URL and anon key
- **Permission errors**: Check that the RLS (Row Level Security) policies are set correctly in Supabase
- **Table not found**: Make sure you ran the SQL migration from `supabase-setup.sql` in your Supabase SQL Editor

