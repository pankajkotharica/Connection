# Deploy to Vercel - Next Steps

Your code is now on GitHub at: https://github.com/pankajkotharica/Connection

## Deploy to Vercel

### Step 1: Go to Vercel
Visit: https://vercel.com

### Step 2: Import Your Repository
1. Click **"Add New Project"** or **"Import Project"**
2. If you haven't connected GitHub, click **"Connect GitHub"** and authorize Vercel
3. Select your repository: **pankajkotharica/Connection**

### Step 3: Configure Project
Vercel should auto-detect Vite settings, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)

### Step 4: Add Environment Variables
**IMPORTANT:** Add these environment variables before deploying:

1. Click **"Environment Variables"**
2. Add the following:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://vkxuhhcyqtvigtwysjkh.supabase.co`
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs`
   - Environment: Production, Preview, Development (select all)

### Step 5: Deploy
Click **"Deploy"** button and wait for the build to complete (usually 1-2 minutes).

### Step 6: Access Your App
After deployment, Vercel will provide you with:
- A production URL (e.g., `https://connection.vercel.app`)
- Preview URLs for each deployment

## Continuous Deployment

Once connected:
- ✅ Every push to the `main` branch will automatically trigger a new deployment
- ✅ You'll get preview URLs for pull requests
- ✅ Build logs are available in the Vercel dashboard

## Verify Deployment

1. Visit your Vercel URL
2. Test adding a contact
3. Check that it saves to your Supabase database
4. Verify the app is working correctly

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure `package.json` has correct build scripts

### App Doesn't Connect to Supabase
- Double-check environment variables in Vercel dashboard
- Make sure you ran the SQL setup in Supabase (see `supabase-setup.sql`)
- Check browser console for errors (F12)

### Need to Update Environment Variables
1. Go to Vercel project settings
2. Navigate to **Settings** > **Environment Variables**
3. Edit or add variables as needed
4. Redeploy to apply changes

## Your Repository
🔗 GitHub: https://github.com/pankajkotharica/Connection


