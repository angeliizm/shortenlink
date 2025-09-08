// Test script to validate analytics system
// Run this after setting up to verify everything works

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAnalytics() {
  console.log('🔍 Testing Analytics System...\n');

  // 1. Check if analytics tables exist
  console.log('1. Checking analytics tables...');
  try {
    const tables = [
      'analytics_events',
      'analytics_sessions',
      'analytics_metrics_hourly',
      'analytics_realtime',
      'analytics_event_queue'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`   ❌ Table ${table} does not exist`);
        console.log('   Please run the migration: 005_analytics_schema.sql');
        return false;
      } else if (error && error.code !== 'PGRST116') {
        console.log(`   ⚠️ Table ${table} error: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table} exists`);
      }
    }
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }

  // 2. Test inserting an event
  console.log('\n2. Testing event insertion...');
  const testEvent = {
    site_slug: 'test-site',
    event_type: 'page_view',
    visitor_id: 'test-visitor-123',
    session_id: 'test-session-456',
    path: '/test',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    is_new_visitor: true
  };

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(testEvent)
      .select()
      .single();

    if (error) {
      console.log(`   ❌ Failed to insert event: ${error.message}`);
      if (error.message.includes('RLS')) {
        console.log('   Note: This might be due to RLS policies. Backend API should use service role.');
      }
    } else {
      console.log(`   ✅ Event inserted with ID: ${data.id}`);
      
      // Clean up test event
      await supabase
        .from('analytics_events')
        .delete()
        .eq('id', data.id);
    }
  } catch (error) {
    console.error('Error testing event insertion:', error);
  }

  // 3. Test API endpoints
  console.log('\n3. Testing API endpoints...');
  const endpoints = [
    { path: '/api/analytics/track', method: 'POST' },
    { path: '/api/analytics/test-site', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `http://localhost:3000${endpoint.path}`;
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (endpoint.method === 'POST') {
        options.body = JSON.stringify(testEvent);
      }

      const response = await fetch(url, options);
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
      } else {
        const text = await response.text();
        console.log(`   ⚠️ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
        if (response.status === 401) {
          console.log('      Note: Authentication required for this endpoint');
        }
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
      if (error.message.includes('ECONNREFUSED')) {
        console.log('      Make sure the Next.js dev server is running (npm run dev)');
      }
    }
  }

  // 4. Check for existing analytics data
  console.log('\n4. Checking for existing analytics data...');
  try {
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('site_slug, event_type, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (!eventsError && events && events.length > 0) {
      console.log(`   ✅ Found ${events.length} recent events:`);
      events.forEach(event => {
        console.log(`      - ${event.site_slug}: ${event.event_type} at ${new Date(event.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('   ℹ️ No analytics events found yet');
      console.log('      Visit a site page to generate events');
    }
  } catch (error) {
    console.error('Error checking events:', error);
  }

  console.log('\n✨ Analytics system test complete!\n');
  
  console.log('Next steps:');
  console.log('1. Visit a site page at /siteler/{site-slug}');
  console.log('2. Click some action buttons');
  console.log('3. Check the analytics dashboard at /dashboard/analytics/{site-slug}');
  console.log('4. Verify events appear in the database\n');
}

// Run the test
testAnalytics().catch(console.error);