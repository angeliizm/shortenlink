import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This endpoint should be called periodically (e.g., via cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request (you should add proper authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Process queued events
    await processQueuedEvents(supabase);
    
    // Aggregate hourly metrics
    await aggregateHourlyMetrics(supabase);
    
    // Clean old realtime data
    await cleanRealtimeData(supabase);
    
    // Clean old sessions
    await cleanOldSessions(supabase);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

async function processQueuedEvents(supabase: any) {
  // Get pending events from queue
  const { data: queuedEvents } = await supabase
    .from('analytics_event_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', 3)
    .limit(100);

  if (!queuedEvents || queuedEvents.length === 0) {
    return;
  }

  for (const queuedEvent of queuedEvents) {
    try {
      // Update status to processing
      await supabase
        .from('analytics_event_queue')
        .update({ status: 'processing' })
        .eq('id', queuedEvent.id);

      // Insert the event
      const { error } = await supabase
        .from('analytics_events')
        .insert(queuedEvent.event_data);

      if (error) {
        throw error;
      }

      // Mark as completed
      await supabase
        .from('analytics_event_queue')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', queuedEvent.id);
    } catch (error) {
      // Increment retry count and mark as pending again
      await supabase
        .from('analytics_event_queue')
        .update({ 
          status: 'pending',
          retry_count: queuedEvent.retry_count + 1,
          error_message: error instanceof Error ? error.message : String(error)
        })
        .eq('id', queuedEvent.id);
    }
  }

  // Clean up old completed events
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('analytics_event_queue')
    .delete()
    .eq('status', 'completed')
    .lt('processed_at', oneWeekAgo);
}

async function aggregateHourlyMetrics(supabase: any) {
  // Get the current hour and previous hour
  const now = new Date();
  const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  const previousHour = new Date(currentHour.getTime() - 60 * 60 * 1000);

  // Check if we've already aggregated for the previous hour
  const { data: existingMetrics } = await supabase
    .from('analytics_metrics_hourly')
    .select('id')
    .eq('hour', previousHour.toISOString())
    .limit(1);

  if (existingMetrics && existingMetrics.length > 0) {
    return; // Already aggregated
  }

  // Get all sites with events in the previous hour
  const { data: sites } = await supabase
    .from('analytics_events')
    .select('site_slug')
    .gte('timestamp', previousHour.toISOString())
    .lt('timestamp', currentHour.toISOString())
    .limit(1000);

  const uniqueSites = Array.from(new Set(sites?.map((s: any) => s.site_slug) || []));

  for (const site of uniqueSites) {
    // Get all events for this site in the previous hour
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('site_slug', site)
      .gte('timestamp', previousHour.toISOString())
      .lt('timestamp', currentHour.toISOString()) as { data: any[] | null; error: any };

    if (!events || events.length === 0) {
      continue;
    }

    // Calculate metrics
    const metrics: any = {
      site_slug: site,
      hour: previousHour.toISOString(),
      page_views: events.filter(e => e.event_type === 'page_view').length,
      unique_visitors: new Set(events.map(e => e.visitor_id)).size,
      sessions: new Set(events.map(e => e.session_id)).size,
      bounces: 0, // Will be calculated from sessions
      total_session_duration: 0, // Will be calculated from sessions
      action_clicks: {},
      referrers: {},
      devices: {},
      browsers: {},
      countries: {},
      utm_sources: {},
      utm_mediums: {},
      utm_campaigns: {},
    };

    // Aggregate action clicks
    const actionClicks = events.filter(e => e.event_type === 'action_click');
    actionClicks.forEach(event => {
      const index = event.action_index?.toString() || 'unknown';
      metrics.action_clicks[index] = (metrics.action_clicks[index] || 0) + 1;
    });

    // Aggregate dimensions
    events.forEach(event => {
      if (event.referrer) {
        metrics.referrers[event.referrer] = (metrics.referrers[event.referrer] || 0) + 1;
      }
      if (event.device_type) {
        metrics.devices[event.device_type] = (metrics.devices[event.device_type] || 0) + 1;
      }
      if (event.browser) {
        metrics.browsers[event.browser] = (metrics.browsers[event.browser] || 0) + 1;
      }
      if (event.country) {
        metrics.countries[event.country] = (metrics.countries[event.country] || 0) + 1;
      }
      if (event.utm_source) {
        metrics.utm_sources[event.utm_source] = (metrics.utm_sources[event.utm_source] || 0) + 1;
      }
      if (event.utm_medium) {
        metrics.utm_mediums[event.utm_medium] = (metrics.utm_mediums[event.utm_medium] || 0) + 1;
      }
      if (event.utm_campaign) {
        metrics.utm_campaigns[event.utm_campaign] = (metrics.utm_campaigns[event.utm_campaign] || 0) + 1;
      }
    });

    // Get session metrics
    const sessionIds = Array.from(new Set(events.map(e => e.session_id).filter(Boolean)));
    if (sessionIds.length > 0) {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .in('id', sessionIds) as { data: any[] | null; error: any };

      if (sessions) {
        metrics.bounces = sessions.filter(s => s.bounce).length;
        metrics.total_session_duration = sessions.reduce((sum, s) => 
          sum + (s.duration_seconds || 0), 0
        );
      }
    }

    // Insert or update metrics
    await supabase
      .from('analytics_metrics_hourly')
      .upsert(metrics);
  }
}

async function cleanRealtimeData(supabase: any) {
  // Remove entries older than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  await supabase
    .from('analytics_realtime')
    .delete()
    .lt('last_seen', fiveMinutesAgo);
}

async function cleanOldSessions(supabase: any) {
  // Mark sessions as ended if they haven't been updated in 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  const { data: staleSessions } = await supabase
    .from('analytics_sessions')
    .select('*')
    .is('ended_at', null)
    .lt('updated_at', thirtyMinutesAgo)
    .limit(100);

  if (staleSessions && staleSessions.length > 0) {
    for (const session of staleSessions) {
      const duration = Math.floor(
        (new Date(thirtyMinutesAgo).getTime() - new Date(session.started_at).getTime()) / 1000
      );

      await supabase
        .from('analytics_sessions')
        .update({
          ended_at: thirtyMinutesAgo,
          duration_seconds: duration,
          bounce: session.page_views <= 1
        })
        .eq('id', session.id);

      // Create a session_end event
      await supabase
        .from('analytics_events')
        .insert({
          site_slug: session.site_slug,
          event_type: 'session_end',
          timestamp: thirtyMinutesAgo,
          session_id: session.id,
          visitor_id: session.visitor_id
        });
    }
  }
}