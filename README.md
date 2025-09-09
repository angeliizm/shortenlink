# ShortenLink - URL Shortener

A modern, full-stack URL shortening service built with Next.js (TypeScript) and Supabase. Deploy seamlessly on Vercel with no Docker or backend infrastructure required.

<!-- Updated for deployment test -->

## Features

- 🔗 Create short links with custom slugs
- 🔒 Password-protected links
- ⏰ Expiring links with time limits
- 📊 Click analytics and tracking
- 🚀 Edge runtime for fast redirects
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 Secure authentication with Supabase Auth
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router) with TypeScript
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Radix UI components
- **Deployment**: Vercel (optimized for edge runtime)
- **Package Manager**: npm

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Vercel account for deployment (optional)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shortenlink.git
cd shortenlink/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase (see detailed instructions below)

4. Configure environment:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

5. Run development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Detailed Setup

### Setting Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project details
   - Save your database password securely

2. **Run Database Migrations**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `frontend/supabase-migrations.sql`
   - Run the SQL to create tables and policies

3. **Configure Authentication**
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates if needed

4. **Get API Credentials**
   - Go to Settings → API
   - Copy your project URL and anon key
   - Get service role key (keep this secret!)

### Environment Variables

Create `.env.local` in the frontend directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for production
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   │   ├── links/         # Link CRUD operations
│   │   └── redirect/      # Redirect handler (edge)
│   ├── dashboard/         # Protected dashboard
│   ├── register/          # Sign up page
│   └── test-supabase/     # Connection test page
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase clients
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## API Routes

All API endpoints are TypeScript-based Next.js Route Handlers:

### Links Management
- `GET /api/links` - List user's links (requires auth)
- `POST /api/links` - Create a new short link
- `GET /api/links/[id]` - Get link details
- `PATCH /api/links/[id]` - Update a link
- `DELETE /api/links/[id]` - Delete a link

### Redirect
- `GET /api/redirect/[slug]` - Redirect to target URL (edge runtime)

## Database Schema

### Tables

**profiles**
- `id` (UUID, references auth.users)
- `email` (unique)
- `name` (optional)
- `avatar_url` (optional)

**links**
- `id` (UUID)
- `user_id` (references auth.users)
- `slug` (unique)
- `target_url`
- `password` (optional)
- `expires_at` (optional)

**clicks**
- `id` (UUID)
- `link_id` (references links)
- `clicked_at`
- `ip_address`
- `user_agent`
- `referer`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

3. **Configure Environment Variables**
   Add these in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

## Testing

### Test Supabase Connection
Visit `/test-supabase` to verify:
- Database connection
- Authentication status
- API routes functionality

### Create a Test Link
1. Sign up/login at your app
2. Go to dashboard
3. Click "Create Link"
4. Enter target URL
5. Optional: Set password, expiration, custom slug
6. Copy the generated short URL
7. Test redirect in new tab

## Security Features

- Row Level Security (RLS) on all tables
- Server-side authentication checks
- Service role key never exposed to client
- Password-protected links
- Automatic HTTPS on Vercel
- CORS handled by same-origin

## Troubleshooting

### Common Issues

**Supabase Connection Failed**
- Check environment variables
- Verify Supabase project is active
- Run migrations in SQL editor

**Authentication Not Working**
- Enable Email provider in Supabase
- Check email confirmation settings
- Verify environment variables

**Redirects Not Working**
- Check if slug exists in database
- Verify link hasn't expired
- Check password if protected

**Build Errors on Vercel**
- Set root directory to `frontend`
- Check all environment variables
- Review build logs for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Create an issue on GitHub for bugs or features
- Check `/test-supabase` for connection diagnostics
- Review Supabase logs for database issues