# Supabase Setup Instructions

Your Supabase project credentials have been configured. Follow these steps to complete the setup:

## 1. Get Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/coufslfrsxvlzbwitzct
2. Navigate to **Settings** → **API**
3. Find and copy your **Service Role Key** (keep this secret!)
4. Add it to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## 2. Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/coufslfrsxvlzbwitzct/sql
2. Copy the entire content of `supabase/migrations/20250106_initial_schema.sql`
3. Paste it in the SQL editor
4. Click **Run** to execute the migration

### Option B: Using Supabase CLI

1. Login to Supabase CLI:
   ```bash
   npx supabase login
   ```
   This will open a browser window for authentication.

2. Link your project:
   ```bash
   npx supabase link --project-ref coufslfrsxvlzbwitzct
   ```

3. Push migrations:
   ```bash
   npx supabase db push
   ```

## 3. Deploy Edge Functions (Optional - for serverless redirects)

If you want to use Supabase Edge Functions for link redirection:

```bash
npx supabase functions deploy redirect
```

## 4. Enable Authentication Providers (Optional)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable desired providers (Email, Google, GitHub, etc.)
3. Configure OAuth credentials if using social providers

## 5. Start Development

```bash
cd frontend
npm install
npm run dev
```

Your app will be available at http://localhost:3000

## Project Details

- **Project URL**: https://coufslfrsxvlzbwitzct.supabase.co
- **Project ID**: coufslfrsxvlzbwitzct
- **Anon Key**: Already configured in `.env.local`

## Testing the Setup

1. Visit http://localhost:3000
2. Try creating an account
3. Create a short link
4. Test the redirection

## Troubleshooting

### If migrations fail:
- Check that you're using the correct project
- Ensure you have the right permissions
- Try running migrations one section at a time

### If authentication doesn't work:
- Verify your Supabase URL and Anon Key
- Check that email provider is enabled in Supabase dashboard
- Ensure redirect URLs are configured correctly

### If you see CORS errors:
- Add http://localhost:3000 to allowed URLs in Supabase dashboard
- Check Authentication → URL Configuration