# Supabase Migration Guide

This project has been migrated from PostgreSQL to Supabase. This guide explains the changes and how to set up the project with Supabase.

## What Changed

### Database
- **From**: Self-hosted PostgreSQL with pgx driver
- **To**: Supabase (PostgreSQL with built-in auth, realtime, and storage)

### Authentication
- **From**: Custom JWT-based authentication
- **To**: Supabase Auth with built-in user management

### File Structure
```
/supabase
  ├── config.toml          # Supabase project configuration
  ├── seed.sql            # Development seed data
  ├── migrations/         # Database migrations
  └── functions/          # Edge Functions
      └── redirect/       # Link redirection handler

/frontend
  └── lib/supabase/       # Supabase client configuration
      ├── client.ts       # Browser client
      ├── server.ts       # Server client
      └── database.types.ts # TypeScript types

/backend
  └── internal/
      ├── database/supabase.go    # Supabase connection
      └── services/supabase_auth.go # Supabase auth service
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down your project credentials:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password

### 2. Configure Environment Variables

Copy `.env.supabase.example` to `.env` and fill in your credentials:

```bash
cp .env.supabase.example .env
```

### 3. Run Migrations

#### Option A: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Using SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the migration from `supabase/migrations/20250106_initial_schema.sql`

### 4. Deploy Edge Functions

```bash
# Deploy the redirect function
supabase functions deploy redirect
```

### 5. Start Development

#### Using Docker Compose (Local Supabase)
```bash
# Start local Supabase stack
docker-compose -f docker-compose.supabase.yml up -d

# Run migrations locally
docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/20250106_initial_schema.sql

# Start frontend
cd frontend && npm run dev
```

#### Using Cloud Supabase
```bash
# Just start the frontend
cd frontend && npm run dev
```

## Key Features with Supabase

### 1. Authentication
- Built-in email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Magic links
- Row Level Security (RLS) for data protection

### 2. Real-time Updates
- Live updates when links are created/updated
- Real-time analytics
- Presence features

### 3. Storage
- Built-in file storage for QR code logos
- Image transformations
- CDN support

### 4. Edge Functions
- Serverless link redirection
- No need for separate backend for redirects
- Global edge deployment

## Migration from Old System

### For Existing Data
If you have existing data in PostgreSQL:

1. Export data from old database:
```bash
pg_dump -h old_host -U postgres -d shortenlink --data-only > data.sql
```

2. Import to Supabase:
```bash
psql -h db.your-project.supabase.co -U postgres -d postgres < data.sql
```

### API Changes

#### Old API (Backend-based)
```javascript
// Old
await axios.post('http://localhost:8080/api/auth/login', { email, password })
```

#### New API (Supabase)
```javascript
// New
await supabase.auth.signInWithPassword({ email, password })
```

## Advantages of Supabase

1. **Simplified Architecture**: No need for separate auth service
2. **Built-in Features**: Auth, storage, realtime out of the box
3. **Scalability**: Automatic scaling with Supabase cloud
4. **Security**: Row Level Security policies
5. **Developer Experience**: Better TypeScript support
6. **Cost**: Free tier includes 500MB database, 50K auth users
7. **Edge Functions**: Global serverless functions
8. **Real-time**: WebSocket-based real-time updates

## Monitoring & Debugging

### Supabase Dashboard
- Monitor database queries
- View auth logs
- Track storage usage
- Debug RLS policies

### Local Development
```bash
# View local Supabase logs
docker-compose -f docker-compose.supabase.yml logs -f

# Access local Supabase Studio
open http://localhost:54323
```

## Troubleshooting

### Common Issues

1. **RLS Policies Blocking Access**
   - Check RLS policies in Supabase dashboard
   - Ensure user is authenticated
   - Verify JWT tokens

2. **Migration Fails**
   - Check for existing tables
   - Verify extensions are enabled
   - Check user permissions

3. **Auth Not Working**
   - Verify environment variables
   - Check redirect URLs
   - Ensure cookies are enabled

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)