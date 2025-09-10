import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const events = await request.json();

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid batch format' },
        { status: 400 }
      );
    }

    // Hash IP for privacy
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    // const ipHash = createHash('sha256').update(ip + process.env.ANALYTICS_SALT || 'default-salt').digest('hex');
    const ipHash = createHash('sha256').update(ip + 'default-salt').digest('hex'); // For testing

    // Prepare all events
    const preparedEvents = events.map(event => ({
      ...event,
      ip_hash: ipHash,
      timestamp: event.timestamp || new Date().toISOString(),
    }));

    // Batch insert events
    const { error } = await supabase
      .from('analytics_events')
      .insert(preparedEvents as any);

    if (error) {
      // If batch insert fails, queue all events for retry
      const queuedEvents = preparedEvents.map(event => ({
        event_data: event,
        status: 'pending'
      }));

      await supabase
        .from('analytics_event_queue')
        .insert(queuedEvents as any);
      
      console.error('Failed to insert analytics batch, queued for retry:', error);
    }

    // Process session-related events
    const sessionEvents = preparedEvents.filter(e => 
      e.event_type === 'session_start' || 
      (e.event_type === 'page_view' && e.session_id)
    );

    for (const event of sessionEvents) {
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id')
        .eq('id', event.session_id)
        .single();

      if (!existingSession) {
        await supabase
          .from('analytics_sessions')
          .upsert({
            id: event.session_id,
            site_slug: event.site_slug,
            visitor_id: event.visitor_id,
            entry_path: event.path,
            device_type: event.device_type,
            browser: event.browser,
            os: event.os,
            country: event.country,
            region: event.region,
          } as any);
      }
    }

    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    console.error('Analytics batch tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track batch events' },
      { status: 500 }
    );
  }
}