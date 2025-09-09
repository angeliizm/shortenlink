import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type PageData = {
  owner_id: string;
  site_slug: string;
};

type AnalyticsMetrics = {
  page_views: number;
  unique_visitors: number;
  sessions: number;
  total_session_duration: number;
  bounces: number;
  hour: string;
};

type AnalyticsEvent = {
  event_type: string;
  visitor_id: string;
  session_id: string;
  action_index?: number;
  action_type?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  timestamp: string;
};

type AnalyticsSession = {
  id: string;
  duration_seconds: number;
  bounce: boolean;
  started_at: string;
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const { slug } = params;
    
    console.log(`[Analytics API] Fetching data for slug: ${slug}`);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const metric = searchParams.get('metric');
    
    console.log(`[Analytics API] Date range: ${startDate} to ${endDate}, Metric: ${metric}`);
    
    // For test-analytics-site, allow unauthenticated access
    let isOwner = false;
    if (slug === 'test-analytics-site') {
      isOwner = true;
    } else {
      // Verify user owns this site
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[Analytics API] No authenticated user');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('owner_id, site_slug')
        .eq('site_slug', slug)
        .single() as { data: PageData | null; error: any };

      if (pageError) {
        console.log(`[Analytics API] Error fetching page: ${pageError.message}`);
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
      }

      if (!page) {
        console.log('[Analytics API] Page not found');
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
      }

      if (page.owner_id !== user.id) {
        console.log('[Analytics API] User does not own this site');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      isOwner = true;
    }

    // Set default date range to last 30 days if not provided
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = endDate || now.toISOString();
    
    console.log(`[Analytics API] Using date range: ${defaultStartDate} to ${defaultEndDate}`);

    // Handle specific metric requests
    if (metric === 'realtime') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: realtime, error } = await supabase
        .from('analytics_realtime')
        .select('*')
        .eq('site_slug', slug)
        .gte('last_seen', fiveMinutesAgo) as { data: any[] | null; error: any };

      if (error) {
        console.log(`[Analytics API] Realtime query error: ${error.message}`);
      }

      const activeVisitors = realtime?.length || 0;
      console.log(`[Analytics API] Realtime: ${activeVisitors} active visitors`);

      return NextResponse.json({
        activeVisitors,
        visitors: realtime || []
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'overview') {
      // First try aggregated metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('analytics_metrics_hourly')
        .select('*')
        .eq('site_slug', slug)
        .gte('hour', defaultStartDate)
        .lte('hour', defaultEndDate)
        .order('hour', { ascending: false }) as { data: AnalyticsMetrics[] | null; error: any };

      let totals = {
        pageViews: 0,
        uniqueVisitors: 0,
        sessions: 0,
        totalDuration: 0,
        bounces: 0,
      };

      if (metrics && metrics.length > 0) {
        console.log(`[Analytics API] Found ${metrics.length} hourly metrics`);
        totals = metrics.reduce((acc, m) => ({
          pageViews: acc.pageViews + (m.page_views || 0),
          uniqueVisitors: acc.uniqueVisitors + (m.unique_visitors || 0),
          sessions: acc.sessions + (m.sessions || 0),
          totalDuration: acc.totalDuration + (m.total_session_duration || 0),
          bounces: acc.bounces + (m.bounces || 0),
        }), totals);
      } else {
        // Fallback to raw events if no aggregated data
        console.log('[Analytics API] No hourly metrics, falling back to raw events');
        
        const { data: events, error: eventsError } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('site_slug', slug)
          .gte('timestamp', defaultStartDate)
          .lte('timestamp', defaultEndDate) as { data: AnalyticsEvent[] | null; error: any };

        if (events && events.length > 0) {
          console.log(`[Analytics API] Found ${events.length} raw events`);
          
          totals.pageViews = events.filter(e => e.event_type === 'page_view').length;
          totals.uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
          totals.sessions = new Set(events.map(e => e.session_id)).size;
          
          // Get session data for duration and bounce rate
          const sessionIds = Array.from(new Set(events.map(e => e.session_id).filter(Boolean)));
          if (sessionIds.length > 0) {
            const { data: sessions } = await supabase
              .from('analytics_sessions')
              .select('*')
              .in('id', sessionIds) as { data: AnalyticsSession[] | null; error: any };
            
            if (sessions) {
              totals.totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
              totals.bounces = sessions.filter(s => s.bounce).length;
            }
          }
        } else {
          console.log('[Analytics API] No events found');
        }
      }

      const avgSessionDuration = totals.sessions > 0 
        ? Math.round(totals.totalDuration / totals.sessions)
        : 0;

      const bounceRate = totals.sessions > 0
        ? Math.round((totals.bounces / totals.sessions) * 100)
        : 0;

      console.log(`[Analytics API] Totals:`, totals);

      return NextResponse.json({
        totals: {
          ...totals,
          avgSessionDuration,
          bounceRate
        },
        timeSeries: metrics || []
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'actions') {
      // Get action clicks from events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('action_index, action_type')
        .eq('site_slug', slug)
        .eq('event_type', 'action_click')
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate) as { data: any[] | null; error: any };

      const actionTotals: Record<string, number> = {};
      
      if (events) {
        console.log(`[Analytics API] Found ${events.length} action click events`);
        events.forEach(event => {
          const index = event.action_index?.toString() || 'unknown';
          actionTotals[index] = (actionTotals[index] || 0) + 1;
        });
      }

      return NextResponse.json({ 
        actions: actionTotals 
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'referrers') {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('referrer')
        .eq('site_slug', slug)
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate)
        .not('referrer', 'is', null) as { data: any[] | null; error: any };

      const referrerCounts: Record<string, number> = {};
      
      if (events) {
        events.forEach(event => {
          const ref = event.referrer || 'direct';
          referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
        });
      }

      const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count }));

      return NextResponse.json({ 
        referrers: topReferrers 
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'devices') {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('device_type, browser')
        .eq('site_slug', slug)
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate) as { data: any[] | null; error: any };

      const deviceTotals: Record<string, number> = {};
      const browserTotals: Record<string, number> = {};
      
      if (events) {
        events.forEach(event => {
          if (event.device_type) {
            deviceTotals[event.device_type] = (deviceTotals[event.device_type] || 0) + 1;
          }
          if (event.browser) {
            browserTotals[event.browser] = (browserTotals[event.browser] || 0) + 1;
          }
        });
      }

      return NextResponse.json({ 
        devices: deviceTotals,
        browsers: browserTotals
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'geography') {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('country')
        .eq('site_slug', slug)
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate)
        .not('country', 'is', null) as { data: any[] | null; error: any };

      const countryTotals: Record<string, number> = {};
      
      if (events) {
        events.forEach(event => {
          if (event.country) {
            countryTotals[event.country] = (countryTotals[event.country] || 0) + 1;
          }
        });
      }

      return NextResponse.json({ 
        countries: countryTotals 
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    if (metric === 'events') {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('site_slug', slug)
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate)
        .order('timestamp', { ascending: false })
        .limit(100) as { data: any[] | null; error: any };

      console.log(`[Analytics API] Found ${events?.length || 0} recent events`);

      return NextResponse.json({ 
        events: events || [] 
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }

    // Default: return all available data
    const [
      { data: events },
      { data: metrics },
      { data: realtime },
      { data: sessions }
    ] = await Promise.all([
      (supabase
        .from('analytics_events')
        .select('*')
        .eq('site_slug', slug)
        .gte('timestamp', defaultStartDate)
        .lte('timestamp', defaultEndDate)
        .order('timestamp', { ascending: false })
        .limit(100)) as unknown as Promise<{ data: any[] | null; error: any }>,
      (supabase
        .from('analytics_metrics_hourly')
        .select('*')
        .eq('site_slug', slug)
        .gte('hour', defaultStartDate)
        .lte('hour', defaultEndDate)
        .order('hour', { ascending: false })) as unknown as Promise<{ data: any[] | null; error: any }>,
      (supabase
        .from('analytics_realtime')
        .select('*')
        .eq('site_slug', slug)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())) as unknown as Promise<{ data: any[] | null; error: any }>,
      (supabase
        .from('analytics_sessions')
        .select('*')
        .eq('site_slug', slug)
        .gte('started_at', defaultStartDate)
        .lte('started_at', defaultEndDate)
        .order('started_at', { ascending: false })
        .limit(50)) as unknown as Promise<{ data: any[] | null; error: any }>
    ]);

    console.log(`[Analytics API] Returning all data - Events: ${events?.length}, Metrics: ${metrics?.length}, Realtime: ${realtime?.length}, Sessions: ${sessions?.length}`);

    return NextResponse.json({
      events: events || [],
      metrics: metrics || [],
      realtime: realtime || [],
      sessions: sessions || []
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}