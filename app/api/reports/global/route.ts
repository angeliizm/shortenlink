import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[Reports API] Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Reports API] User authenticated:', user.id);

    // Check if user is admin or moderator - using direct database query like other APIs
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const userRole = (roleData as { role: string } | null)?.role || 'pending';
    console.log('[Reports API] User role:', userRole);
    
    if (!['admin', 'moderator'].includes(userRole)) {
      console.log('[Reports API] Access denied for role:', userRole);
      return NextResponse.json({ 
        error: 'Forbidden', 
        userRole: userRole,
        userId: user.id 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || '24h';
    
    // Calculate date range based on time_range parameter
    let startDate: string;
    const endDate = new Date().toISOString();
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all':
        startDate = new Date('2020-01-01').toISOString(); // Far back date
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get all sites overview
    const { data: sitesData, error: sitesError } = await supabase
      .from('pages')
      .select(`
        id,
        site_slug,
        title,
        owner_id,
        created_at,
        is_enabled
      `)
      .eq('is_enabled', true)
      .order('created_at', { ascending: false });

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      return NextResponse.json({ error: 'Failed to fetch sites data' }, { status: 500 });
    }

    // Get global analytics metrics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics_events')
      .select('site_slug, event_type, timestamp, country, device_type, browser, referrer, action_index')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    // Get hourly analytics data
    const { data: hourlyData, error: hourlyError } = await supabase
      .from('analytics_events')
      .select('timestamp, event_type')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    // Process analytics data
    const siteMetrics = new Map();
    const globalMetrics = {
      totalPageViews: 0,
      totalClicks: 0,
      totalSessions: 0,
      uniqueVisitors: new Set(),
      countries: new Map(),
      devices: new Map(),
      browsers: new Map(),
      referrers: new Map(),
      topSites: new Map()
    };

    // Process hourly data
    const hourlyMetrics = new Map();
    for (let hour = 0; hour < 24; hour++) {
      hourlyMetrics.set(hour, {
        pageViews: 0,
        clicks: 0,
        sessions: 0,
        total: 0
      });
    }

    analyticsData?.forEach((event: any) => {
      const siteSlug = event.site_slug;
      
      // Initialize site metrics if not exists
      if (!siteMetrics.has(siteSlug)) {
        siteMetrics.set(siteSlug, {
          pageViews: 0,
          clicks: 0,
          sessions: 0,
          uniqueVisitors: new Set(),
          lastActivity: event.timestamp
        });
      }

      const siteMetric = siteMetrics.get(siteSlug);

      // Process by event type
      switch (event.event_type) {
        case 'page_view':
          siteMetric.pageViews++;
          globalMetrics.totalPageViews++;
          globalMetrics.topSites.set(siteSlug, (globalMetrics.topSites.get(siteSlug) || 0) + 1);
          break;
        case 'action_click':
          siteMetric.clicks++;
          globalMetrics.totalClicks++;
          break;
        case 'session_start':
          siteMetric.sessions++;
          globalMetrics.totalSessions++;
          break;
        case 'unique_visitor':
          // Add to both site and global unique visitors
          siteMetric.uniqueVisitors.add(`${siteSlug}_${event.timestamp}`);
          globalMetrics.uniqueVisitors.add(`${siteSlug}_${event.timestamp}`);
          break;
      }

      // Global aggregations
      if (event.country) {
        globalMetrics.countries.set(event.country, (globalMetrics.countries.get(event.country) || 0) + 1);
      }
      if (event.device_type) {
        globalMetrics.devices.set(event.device_type, (globalMetrics.devices.get(event.device_type) || 0) + 1);
      }
      if (event.browser) {
        globalMetrics.browsers.set(event.browser, (globalMetrics.browsers.get(event.browser) || 0) + 1);
      }
      if (event.referrer && event.referrer !== 'direct') {
        globalMetrics.referrers.set(event.referrer, (globalMetrics.referrers.get(event.referrer) || 0) + 1);
      }
    });

    // Process hourly data
    hourlyData?.forEach((event: any) => {
      const eventDate = new Date(event.timestamp);
      const hour = eventDate.getHours();
      const hourlyMetric = hourlyMetrics.get(hour);
      
      if (hourlyMetric) {
        hourlyMetric.total++;
        
        switch (event.event_type) {
          case 'page_view':
            hourlyMetric.pageViews++;
            break;
          case 'action_click':
            hourlyMetric.clicks++;
            break;
          case 'session_start':
            hourlyMetric.sessions++;
            break;
        }
      }
    });

    // Convert site metrics to array with site info
    const sitesWithMetrics = sitesData?.map((site: any) => {
      const metrics = siteMetrics.get(site.site_slug) || {
        pageViews: 0,
        clicks: 0,
        sessions: 0,
        uniqueVisitors: new Set(),
        lastActivity: null
      };

      return {
        ...site,
        profiles: {
          email: 'N/A', // Will be populated separately if needed
          full_name: null
        },
        metrics: {
          pageViews: metrics.pageViews,
          clicks: metrics.clicks,
          sessions: metrics.sessions,
          uniqueVisitors: metrics.uniqueVisitors.size,
          lastActivity: metrics.lastActivity
        }
      };
    }) || [];

    // Prepare response data
    const responseData = {
      overview: {
        totalSites: sitesData?.length || 0,
        activeSites: sitesWithMetrics.filter(site => site.metrics.pageViews > 0).length,
        totalPageViews: globalMetrics.totalPageViews,
        totalClicks: globalMetrics.totalClicks,
        totalSessions: globalMetrics.totalSessions,
        uniqueVisitors: globalMetrics.uniqueVisitors.size
      },
      sites: sitesWithMetrics.sort((a, b) => b.metrics.pageViews - a.metrics.pageViews),
      analytics: {
        topSites: Array.from(globalMetrics.topSites.entries())
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([slug, views]) => ({ slug, views })),
        countries: Array.from(globalMetrics.countries.entries())
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([country, count]) => ({ country, count })),
        devices: Array.from(globalMetrics.devices.entries())
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([device, count]) => ({ device, count })),
        browsers: Array.from(globalMetrics.browsers.entries())
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([browser, count]) => ({ browser, count })),
        referrers: Array.from(globalMetrics.referrers.entries())
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([referrer, count]) => ({ referrer, count }))
      },
      hourly: Array.from({ length: 24 }, (_, hour) => {
        const metrics = hourlyMetrics.get(hour) || {
          pageViews: 0,
          clicks: 0,
          sessions: 0,
          total: 0
        };
        return {
          hour: hour,
          hourLabel: `${hour.toString().padStart(2, '0')}:00`,
          pageViews: metrics.pageViews,
          clicks: metrics.clicks,
          sessions: metrics.sessions,
          total: metrics.total
        };
      }),
      dateRange: {
        startDate,
        endDate,
        timeRange
      }
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error) {
    console.error('Error in global reports API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
