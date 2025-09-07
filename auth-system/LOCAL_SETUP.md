# Local Setup with Supabase

This auth system now uses your Supabase project for database and authentication.

## Quick Start

### 1. Get your Supabase Database Password

1. Go to: https://supabase.com/dashboard/project/coufslfrsxvlzbwitzct/settings/database
2. Copy your database password
3. Update `backend/.env` file - replace `YOUR_SUPABASE_PASSWORD` with your actual password

### 2. Run the Auth Table Migration in Supabase

Go to SQL Editor: https://supabase.com/dashboard/project/coufslfrsxvlzbwitzct/sql

Run this SQL to create the auth tables:

```sql
-- Create auth schema tables if using custom auth
CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for refresh tokens
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);
```

### 3. Install Backend Dependencies

```bash
cd auth-system/backend
go mod download
```

### 4. Run the Backend

```bash
cd auth-system/backend
go run cmd/api/main.go
```

The backend will start on http://localhost:8080

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd auth-system/web
npm install
```

### 6. Run the Frontend

```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Testing the System

1. Open http://localhost:3000
2. Click "Register" to create a new account
3. Login with your credentials
4. You'll be redirected to the dashboard
5. The system uses:
   - Supabase for database
   - Local JWT tokens for session management
   - Secure cookies for auth

## Features

- ✅ User registration and login
- ✅ JWT access tokens (15 min)
- ✅ Refresh token rotation
- ✅ Secure httpOnly cookies
- ✅ Protected dashboard
- ✅ Automatic token refresh
- ✅ Logout functionality

## API Endpoints

- `POST http://localhost:8080/auth/register` - Register new user
- `POST http://localhost:8080/auth/login` - Login
- `POST http://localhost:8080/auth/refresh` - Refresh token
- `POST http://localhost:8080/auth/logout` - Logout
- `GET http://localhost:8080/me` - Get current user (requires auth)

## No Docker Required!

This setup runs directly on your machine using:
- Your Supabase cloud database
- Go backend running locally
- Next.js frontend running locally

## Troubleshooting

If you get connection errors:
1. Check your Supabase database password in `.env`
2. Make sure your Supabase project is active
3. Check the connection string format

If auth doesn't work:
1. Run the migration SQL in Supabase
2. Check backend logs for errors
3. Verify cookies are being set in browser DevTools