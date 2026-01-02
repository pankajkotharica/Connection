# Git Installation Required

Git is not currently installed on your system. Follow these steps:

## Install Git on Windows

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - The download will start automatically

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard
   - **Important options to select:**
     - ✅ Select "Git from the command line and also from 3rd-party software"
     - ✅ Use default options for most settings
     - ✅ Select your preferred editor (VS Code, Notepad++, etc.)

3. **Complete Installation:**
   - Click "Install" and wait for completion
   - Click "Finish"

4. **Restart Your Terminal:**
   - **Close your current PowerShell/Command Prompt window**
   - Open a new terminal window
   - This is required for Git to be available in your PATH

5. **Verify Installation:**
   ```bash
   git --version
   ```
   You should see something like: `git version 2.x.x`

## After Installing Git

Once Git is installed and you've restarted your terminal, run these commands:

```bash
# Navigate to your project directory
cd "d:\personal projects\nexus---personal-networking-manager"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Nexus personal networking manager"
```

## Alternative: Use GitHub Desktop

If you prefer a GUI, you can use GitHub Desktop instead:

1. Download from: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Use "Add" > "Add Existing Repository" to add your project
4. Use the GUI to commit and push

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guide: https://guides.github.com/



