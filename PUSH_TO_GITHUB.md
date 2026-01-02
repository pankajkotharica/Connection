# Push to GitHub - Next Steps

Your code is committed locally. Now push it to GitHub:

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `nexus-networking-manager` (or any name you prefer)
3. Make it **Public** or **Private**
4. **DO NOT** check any boxes (no README, .gitignore, or license)
5. Click **Create repository**

## Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Run these (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Navigate to project directory
cd "d:\personal projects\nexus---personal-networking-manager"

# Add GitHub remote (use YOUR actual repository URL from GitHub)
& "C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/YOUR_USERNAME/nexus-networking-manager.git

# Rename branch to main (GitHub uses 'main' by default)
& "C:\Program Files\Git\cmd\git.exe" branch -M main

# Push to GitHub
& "C:\Program Files\Git\cmd\git.exe" push -u origin main
```

**Note:** You'll be prompted for your GitHub username and password/token when pushing.

## Step 3: Deploy to Vercel

After pushing to GitHub:

1. Go to: https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = `https://vkxuhhcyqtvigtwysjkh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs`
5. Click **Deploy**

Your app will be live in a few minutes!




