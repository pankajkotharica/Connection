# Quick Start Guide

## Issue: App Not Opening on Localhost

If the app is not opening, follow these steps:

### Step 1: Verify Node.js is Installed

Open PowerShell or Command Prompt and run:
```bash
node --version
npm --version
```

If you see version numbers, Node.js is installed. If you get an error, install Node.js from [nodejs.org](https://nodejs.org/) (download the LTS version).

### Step 2: Install Dependencies

In the project directory, run:
```bash
npm install
```

This will install all required packages including React, Vite, and Supabase.

### Step 3: Create Environment File

Create a file named `.env.local` in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** If you don't have Supabase set up yet, you can use placeholder values temporarily:
```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder
```

The app will start but database features won't work until you configure Supabase properly.

### Step 4: Run the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

### Step 5: Open in Browser

Open your browser and navigate to: **http://localhost:3000**

## Common Issues

### "npm is not recognized"
- Node.js is not installed or not in your PATH
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

### Port 3000 already in use
- Another application is using port 3000
- Stop the other application or change the port in `vite.config.ts`

### Module not found errors
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

### Supabase connection errors
- Make sure your `.env.local` file has the correct Supabase credentials
- Check that you've run the SQL migration in Supabase (see `supabase-setup.sql`)

