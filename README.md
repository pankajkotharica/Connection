<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:** Node.js (v18 or higher) - [Download here](https://nodejs.org/)

### Quick Start

1. **Verify Node.js is installed:**
   ```bash
   node --version
   npm --version
   ```
   If these commands don't work, install Node.js from [nodejs.org](https://nodejs.org/)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your Project URL and anon key from Settings > API
   - Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor

4. **Configure environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Run the app:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to `http://localhost:3000`

### Having Issues?

- **App not starting?** See [QUICK_START.md](./QUICK_START.md) for step-by-step help
- **Errors or problems?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Detailed setup:** See [SETUP.md](./SETUP.md) for complete instructions
