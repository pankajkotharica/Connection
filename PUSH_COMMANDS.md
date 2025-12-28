# Commands to Push to GitHub

**Prerequisites:** You must create a GitHub repository first at https://github.com/new

After creating the repository, run these commands:

## Option 1: HTTPS (Recommended for beginners)

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual values:

```bash
cd "d:\personal projects\nexus---personal-networking-manager"

# Add GitHub remote
& "C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (GitHub standard)
& "C:\Program Files\Git\cmd\git.exe" branch -M main

# Push to GitHub
& "C:\Program Files\Git\cmd\git.exe" push -u origin main
```

## Option 2: If you already have a remote, just push

```bash
cd "d:\personal projects\nexus---personal-networking-manager"

# Check current remote
& "C:\Program Files\Git\cmd\git.exe" remote -v

# Push to GitHub (if remote exists)
& "C:\Program Files\Git\cmd\git.exe" branch -M main
& "C:\Program Files\Git\cmd\git.exe" push -u origin main
```

**Note:** You'll be prompted for your GitHub username and password/token when pushing.

## After Pushing

Once pushed to GitHub, you can:
1. View your code on GitHub
2. Deploy to Vercel by importing the GitHub repository
3. Set up continuous deployment (auto-deploy on every push)

