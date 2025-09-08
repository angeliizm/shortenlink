# Analytics System Setup & Validation

## ⚠️ Important: Port Configuration

Your Next.js app is running on **port 3001** (not 3000) because another application is using port 3000.

**Access your app at: http://localhost:3001**

## 🚀 Quick Setup

### Step 1: Database Setup
1. Open your Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy and paste the contents of `scripts/setup-analytics.sql`
4. Click "Run"
5. You should see "Analytics setup complete!" message

### Step 2: Test Analytics System
1. Visit: **http://localhost:3001/test-analytics**
2. You should see the Analytics System Test page with:
   - Session Information (Visitor ID, Session ID)
   - Test buttons for tracking events
   - Event log

### Step 3: Generate Test Events
1. On the test page, click various buttons:
   - Click "Button 0", "Button 1", etc. to test action tracking
   - Click "Track Login"/"Track Logout" for auth events
   - The Event Log will show each tracked event with timestamp

### Step 4: Verify in Database
Go to Supabase Table Editor and check:

```sql
-- Check recent events
SELECT * FROM analytics_events 
WHERE site_slug = 'test-analytics-site'
ORDER BY timestamp DESC 
LIMIT 10;
```

You should see:
- `page_view` events
- `action_click` events with button indices
- Other events you triggered

### Step 5: Test on Real Site Pages
1. Visit any of your sites: **http://localhost:3001/siteler/{your-site-slug}**
2. Open Browser DevTools → Network tab
3. Filter by "analytics"
4. Click action buttons on the page
5. You should see POST requests to `/api/analytics/track`

### Step 6: View Analytics Dashboard
1. Go to main dashboard: **http://localhost:3001/dashboard**
2. Click the chart icon (📊) next to any site
3. Or directly visit: **http://localhost:3001/dashboard/analytics/{site-slug}**

The dashboard will show:
- Total page views
- Unique visitors
- Average session duration
- Bounce rate
- Time series charts
- Action button click counts
- Device/browser breakdowns
- Recent events

## ✅ Validation Checklist

### Analytics Tracking
- [ ] Test page at `/test-analytics` loads correctly
- [ ] Session IDs are generated (check localStorage)
- [ ] Events appear in Event Log when buttons clicked
- [ ] Events saved to database (check analytics_events table)

### Site Pages
- [ ] Page views tracked automatically on load
- [ ] Action button clicks tracked with correct index
- [ ] Network requests to `/api/analytics/track` succeed

### Dashboard
- [ ] Analytics dashboard loads for site owners
- [ ] Metrics display correctly
- [ ] Charts render with data
- [ ] Realtime updates work (10-second refresh)

### Privacy
- [ ] No personal data in analytics_events table
- [ ] Visitor IDs are UUIDs (not emails/names)
- [ ] IP addresses are hashed (if configured)

## 🔧 Troubleshooting

### "API health check error" on test page
This is expected if you're not authenticated. The test page still tracks events correctly.

### No events in database
1. Check browser console for errors
2. Verify Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
3. Ensure analytics tables were created (run SQL script)

### Dashboard shows no data
1. Verify you're logged in as the site owner
2. Check that site_slug in events matches your pages table
3. Generate some test events first

### Port 3000 vs 3001 issues
- Always use **http://localhost:3001** for your app
- The other application on port 3000 doesn't affect analytics

## 📊 How It Works

1. **Client-side tracking** (`hooks/useAnalytics.ts`):
   - Generates anonymous visitor/session IDs
   - Batches events for performance
   - Handles offline with retry queue

2. **API endpoints** (`app/api/analytics/*`):
   - `/track` - Single event tracking
   - `/track/batch` - Batch event processing
   - `/[slug]` - Fetch analytics data
   - `/export/[slug]` - CSV export

3. **Database** (Supabase):
   - `analytics_events` - Raw event data
   - `analytics_sessions` - Session tracking
   - `analytics_metrics_hourly` - Aggregated metrics
   - `analytics_realtime` - Live visitor tracking

4. **Dashboard** (`components/analytics/AnalyticsDashboard.tsx`):
   - Fetches and displays metrics
   - Real-time updates every 10 seconds
   - Multiple chart types and filters

## 🎉 Success!

Once you've completed the checklist above, your analytics system is fully operational and tracking all site interactions!