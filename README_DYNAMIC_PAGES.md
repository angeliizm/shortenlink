# Dynamic Pages System

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional, for admin operations)

## Database Setup

1. Run the migration in Supabase:
   ```bash
   npx supabase db push --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
   ```
   Or copy the contents of `./supabase/migrations/001_dynamic_pages_schema.sql` to Supabase SQL Editor

2. The migration includes:
   - Complete schema with tables, indexes, and constraints
   - Row Level Security policies
   - RPC functions for data access
   - Storage bucket for assets
   - Demo seed data (demo and casinofikret pages)

## Running the Application

```bash
npm install
npm run dev
```

## Testing

Visit:
- `/demo` - Shows embeddable content with actions
- `/casinofikret` - Shows fallback card (betting sites typically block embedding)

## Features

- **Dynamic Routing**: `/{slug}` routes load configuration from Supabase
- **Custom Domains**: Support for custom domain resolution
- **Iframe Embedding**: Attempts to embed target URL with automatic fallback
- **Data-Driven UI**: All visual elements (colors, titles, actions) from database
- **Row Level Security**: Strict access control with owner-based permissions
- **SEO Control**: Per-page meta tags and noindex support

## Database Schema

### Tables
- `pages`: Main page configurations
- `page_actions`: Action buttons for each page  
- `custom_domains`: Custom domain mappings
- Storage bucket: `page-assets` for favicons/images

### RPC Functions
- `get_page_by_slug(site_slug)`: Fetch page by slug
- `get_page_by_domain(hostname)`: Fetch page by custom domain
- `upsert_page(...)`: Create/update pages
- `upsert_action(...)`: Create/update actions

### Security
- RLS enabled on all tables
- Public read for enabled pages only
- Owner-only write permissions
- Admin role override capability