# Deploy Flask Backend to Vercel

Your Flask backend API has been set up to work with Vercel. Vercel will automatically detect the Flask app.

## Important Notes

⚠️ **Vercel Auto-Detection**: Vercel automatically detects Flask when it finds `app.py`, `index.py`, or `server.py` at the root level. However, since you have a React frontend, Vercel will prioritize the frontend build.

## Two Options for Deployment

### Option 1: Deploy Flask API Separately (Recommended)

Since you already have a React frontend deployed on Vercel, the best approach is to deploy the Flask backend as a separate Vercel project:

1. **Create a new Vercel project** for the Flask backend:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - In the project settings, set:
     - **Root Directory**: `/` (or create a separate branch)
     - **Framework Preset**: Other (or Python)
     - **Build Command**: (leave empty or `pip install -r requirements.txt`)
     - **Output Directory**: (leave empty)
   
2. **Add Environment Variables**:
   - `SUPABASE_URL`: `https://vkxuhhcyqtvigtwysjkh.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs`

3. **Deploy**: Click "Deploy"

### Option 2: Use Alternative Platform for Flask Backend

For Flask applications with SQLite or complex database requirements, consider:

- **Railway**: https://railway.app (great for Flask + PostgreSQL)
- **Render**: https://render.com (free tier available)
- **Fly.io**: https://fly.io (good for Docker deployments)
- **Heroku**: https://heroku.com (requires credit card for free tier)

These platforms are better suited for traditional Flask applications with persistent storage.

## API Endpoints

Once deployed, your Flask API will be available at:

- `POST /api/organization/login` - User login
- `GET /api/organization/dashboard?bhag=B01` - Get members by bhag code
- `POST /api/organization/update/<member_id>` - Update member
- `GET /api/organization/health` - Health check

## Current Setup

- ✅ Flask app: `api_server.py` (ready for Vercel auto-detection)
- ✅ Requirements: `requirements.txt`
- ✅ Uses Supabase PostgreSQL (no SQLite needed)

## Next Steps

1. Ensure you've run `supabase-organization-setup.sql` in your Supabase SQL Editor to create the `users` and `members` tables
2. Deploy the Flask backend using Option 1 or Option 2 above
3. Update your frontend to call the Flask API endpoints



