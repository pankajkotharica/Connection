# Flask Backend - Organization Management System

This is a Flask backend application for managing organization members with Bhag-based access control.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python app.py
   ```

3. **Access the application:**
   - Open `http://localhost:5000` in your browser
   - Login with test credentials:
     - Username: `admin_b01`
     - Password: `password123`

## Features

- User authentication with Bhag code access control
- Member management with filtering by Bhag code
- Activation status tracking
- Nagar code and Basti code assignment

## Database

The application uses SQLite by default (`organisation.db`). The database will be created automatically when you run the app for the first time.

## Notes

- This is a separate Flask backend. If you want to use Supabase instead, see `supabase-organization-setup.sql` in the root directory.
- For production, change the `secret_key` to a secure random string.
- Consider using password hashing instead of storing plain text passwords.


