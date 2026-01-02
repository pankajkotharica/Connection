# Deployment Guide

This guide will help you deploy your Nexus app to Vercel and connect it to Git (GitHub).

## Prerequisites

1. **Install Git** (if not already installed):
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - During installation, make sure to select "Git from the command line and also from 3rd-party software"
   - Restart your terminal after installation

2. **Create a GitHub account** (if you don't have one):
   - Go to [github.com](https://github.com) and sign up

3. **Create a Vercel account** (if you don't have one):
   - Go to [vercel.com](https://vercel.com) and sign up (you can use your GitHub account)

## Step 1: Initialize Git Repository

1. Open PowerShell or Command Prompt in your project directory

2. Initialize git:
   ```bash
   git init
   ```

3. Add all files:
   ```bash
   git add .
   ```

4. Create initial commit:
   ```bash
   git commit -m "Initial commit: Nexus personal networking manager"
   ```

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Name your repository (e.g., `nexus-networking-manager`)
5. Make it **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

## Step 3: Push to GitHub

After creating the repository, GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/nexus-networking-manager.git
git branch -M main
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/nexus-networking-manager.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository:
   - If you haven't connected GitHub, click **Connect GitHub** and authorize Vercel
   - Select your repository from the list
4. Configure the project:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
5. **Add Environment Variables**:
   - Click **Environment Variables**
   - Add the following:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: `https://vkxuhhcyqtvigtwysjkh.supabase.co`
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs`
6. Click **Deploy**

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Add environment variables when prompted

## Step 5: Verify Deployment

1. After deployment, Vercel will provide you with a URL (e.g., `https://your-app.vercel.app`)
2. Visit the URL in your browser
3. Test the app by adding a contact
4. Verify it's saving to your Supabase database

## Continuous Deployment

Once connected:
- Every push to the `main` branch will automatically trigger a new deployment
- Vercel will build and deploy your app automatically
- You'll get a preview URL for each deployment

## Environment Variables in Vercel

Your environment variables are securely stored in Vercel. To update them:
1. Go to your project in Vercel dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add, edit, or remove variables as needed
4. Redeploy to apply changes

## Troubleshooting

### Git Issues
- If `git` command is not recognized, make sure Git is installed and you've restarted your terminal
- If you get authentication errors, you may need to set up SSH keys or use a personal access token

### Vercel Deployment Issues
- Make sure all environment variables are set in Vercel dashboard
- Check the build logs in Vercel dashboard for errors
- Verify that `package.json` has the correct build scripts

### Build Errors
- Check that `node_modules` is in `.gitignore` (it should be)
- Make sure `dist` folder is in `.gitignore`
- Verify that `.env.local` is in `.gitignore` (it should be - never commit secrets!)

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your secrets won't be committed
- ✅ Environment variables in Vercel are encrypted
- ⚠️ Your Supabase anon key is safe to expose in frontend code (it's designed for client-side use)
- ⚠️ For production, consider adding authentication to restrict database access




