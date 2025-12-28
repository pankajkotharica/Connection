# Quick Deploy Commands

Once Git is installed and you've restarted your terminal, run these commands in order:

## 1. Install Git (if not installed)
Download from: https://git-scm.com/download/win
**Important:** Restart your terminal after installing Git!

## 2. Initialize and Commit

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Nexus personal networking manager"
```

## 3. Create GitHub Repository

1. Go to https://github.com and create a new repository
2. Name it (e.g., `nexus-networking-manager`)
3. **Don't** initialize with README
4. Copy the repository URL

## 4. Connect and Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## 5. Deploy to Vercel

### Option A: Via Web Dashboard (Easiest)

1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = `https://vkxuhhcyqtvigtwysjkh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs`
5. Click **Deploy**

### Option B: Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel
```

## Next Steps

After deployment:
- Your app will be live at `https://your-app.vercel.app`
- Every git push to main will auto-deploy
- Check build logs in Vercel dashboard if there are issues

