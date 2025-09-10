# Analytics System Validation Guide

## Setup Steps

### 1. Database Setup
Run the following SQL in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the contents of `scripts/setup-analytics.sql`
5. Click "Run"
6. You should see "Analytics setup complete!" message

### 2. Verify Tables Created
In Supabase Table Editor, verify these tables exist:
- [ ] analytics_events
- [ ] analytics_sessions  
- [ ] analytics_metrics_hourly
- [ ] analytics_realtime
- [ ] analytics_event_queue

## Testing Steps

### 3. Test Analytics Tracking Page
1. Visit http://localhost:3000/test-analytics
2. You should see:
   - Session Information (Visitor ID, Session ID)
   - Test buttons for different event types
   - Event log showing tracked events

### 4. Generate Test Events
On the test page:
1. Click "Button 0", "Button 1", etc. to test action clicks
2. Click "Track Login" and "Track Logout" for auth events
3. Click "Track View", "Track Edit" for dashboard events
4. Click "Check API Status" to verify API health

### 5. Test Real Site Page
1. Visit any of your sites: http://localhost:3000/{your-site-slug}
2. Open browser DevTools > Network tab
3. Look for requests to `/api/analytics/track`
4. Click action buttons on the page
5. Verify new track requests are sent

### 6. Verify Database Records
In Supabase Table Editor:

1. Check `analytics_events` table:
   ```sql
   SELECT * FROM analytics_events 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```
   - [ ] You should see page_view events
   - [ ] You should see action_click events
   - [ ] Events should have visitor_id and session_id

2. Check `analytics_sessions` table:
   ```sql
   SELECT * FROM analytics_sessions 
   ORDER BY started_at DESC 
   LIMIT 5;
   ```
   - [ ] Sessions should be created
   - [ ] Page views counter should increment

3. Check `analytics_realtime` table:
   ```sql
   SELECT * FROM analytics_realtime 
   WHERE last_seen > NOW() - INTERVAL '5 minutes';
   ```
   - [ ] Should show active visitors

### 7. Test Analytics Dashboard
1. Visit http://localhost:3000/dashboard
2. Click the chart icon (📊) next to any site
3. Dashboard should show:
   - [ ] Total page views
   - [ ] Unique visitors count
   - [ ] Average session duration
   - [ ] Bounce rate
   - [ ] Time series chart
   - [ ] Recent events table

### 8. Test Realtime Updates
1. Open analytics dashboard in one tab
2. Open the site page in another tab
3. Click some buttons on the site
4. Within 10 seconds, the dashboard should update:
   - [ ] Active visitors count increases
   - [ ] Recent events appear in the table

### 9. Test Privacy Features
1. Open browser DevTools > Application > Local Storage
   - [ ] Verify `analytics_visitor_id` is set
   - [ ] Verify it's a UUID, not personal data

2. Open DevTools > Network
   - [ ] Check `/api/analytics/track` requests
   - [ ] Verify no personal information is sent
   - [ ] No raw IP addresses in payload

### 10. Test Reliability
1. Open DevTools > Network
2. Set to "Offline" mode
3. Click some buttons on the site
4. Go back online
5. Events should be queued and sent when connection returns

## Validation Checklist

### ✅ Event Tracking
- [ ] Page views are tracked on site load
- [ ] Button clicks are tracked with correct index
- [ ] Session starts/ends are tracked
- [ ] Events contain all required dimensions

### ✅ Data Flow
- [ ] Events reach the database
- [ ] Sessions are created and updated
- [ ] Realtime table updates
- [ ] Hourly metrics aggregate (after some time)

### ✅ Dashboard
- [ ] Metrics display correctly
- [ ] Charts render with data
- [ ] Date range filters work
- [ ] Export CSV works

### ✅ Privacy & Performance
- [ ] No PII in database
- [ ] DNT header respected
- [ ] Page performance not impacted
- [ ] Events batch properly

## Troubleshooting

### If events aren't being tracked:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify Supabase credentials in `.env.local`
4. Check RLS policies in Supabase

### If dashboard shows no data:
1. Verify you're logged in as the site owner
2. Check that events exist in the database
3. Verify site_slug matches between events and pages table
4. Check browser console for API errors

### If realtime doesn't update:
1. Verify analytics_realtime table has recent entries
2. Check that the dashboard is fetching every 10 seconds
3. Look for console errors in the dashboard

## Success Criteria
✅ Events are tracked without blocking UI
✅ Dashboard shows accurate metrics
✅ Realtime updates work
✅ No personal data is stored
✅ System handles offline/errors gracefully