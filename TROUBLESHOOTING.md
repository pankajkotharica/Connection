# Troubleshooting Guide

## App Not Opening on Localhost

### Issue: npm/node commands not found

**Problem:** When you run `npm install` or `npm run dev`, you get an error like:
- `npm is not recognized as the name of a cmdlet`
- `node is not recognized`

**Solution:**
1. Node.js is not installed on your system
2. Download and install Node.js from [nodejs.org](https://nodejs.org/)
3. Choose the **LTS (Long Term Support)** version
4. During installation, make sure to check "Add to PATH" option
5. **Restart your terminal/PowerShell** after installation
6. Verify installation by running:
   ```bash
   node --version
   npm --version
   ```

### Issue: Dependencies not installed

**Problem:** `node_modules` folder doesn't exist

**Solution:**
1. Open terminal/PowerShell in the project directory
2. Run: `npm install`
3. Wait for installation to complete (may take a few minutes)
4. You should see a `node_modules` folder created

### Issue: Port 3000 already in use

**Problem:** When running `npm run dev`, you see:
- `Port 3000 is already in use`
- `EADDRINUSE: address already in use`

**Solution:**
1. Find what's using port 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Stop the process using that port, OR
3. Change the port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3001,  // Change 3000 to 3001 or another port
     host: '0.0.0.0',
   }
   ```

### Issue: Module not found errors

**Problem:** When running the app, you see errors like:
- `Cannot find module '@supabase/supabase-js'`
- `Cannot find module 'react'`

**Solution:**
1. Delete `node_modules` folder (if it exists)
2. Delete `package-lock.json` file (if it exists)
3. Run: `npm install`
4. Try running the app again: `npm run dev`

### Issue: Supabase connection errors

**Problem:** App starts but shows errors about Supabase

**Solution:**
1. Make sure `.env.local` file exists in the project root
2. Check that it contains:
   ```env
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   ```
3. Get these values from your Supabase project: Settings > API
4. Make sure you've run the SQL from `supabase-setup.sql` in Supabase SQL Editor
5. Restart the dev server after changing `.env.local`

### Issue: Browser shows blank page or errors

**Problem:** App runs but browser shows errors

**Check the browser console:**
1. Open browser Developer Tools (F12)
2. Check the Console tab for errors
3. Check the Network tab for failed requests

**Common fixes:**
- Clear browser cache and reload
- Check that the dev server is running on the correct port
- Verify all environment variables are set correctly

## Still Having Issues?

1. Check that you're in the correct directory (should contain `package.json`)
2. Make sure you have an active internet connection (for npm install)
3. Try running commands as Administrator (right-click PowerShell > Run as Administrator)
4. Check the terminal output for specific error messages


