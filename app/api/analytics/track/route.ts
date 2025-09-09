import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const event = await request.json();

    // Hash IP for privacy
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const ipHash = createHash('sha256').update(ip + process.env.ANALYTICS_SALT || 'default-salt').digest('hex');

    // Prepare event data
    const eventData = {
      ...event,
      ip_hash: ipHash,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Insert event into database
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData as any);

    if (error) {
      // If insert fails, add to queue for retry
      await supabase
        .from('analytics_event_queue')
        .insert({
          event_data: eventData,
          status: 'pending'
        } as any);
      
      console.error('Failed to insert analytics event, queued for retry:', error);
    }

    // Handle session creation for new sessions
    if (event.event_type === 'session_start' || 
        (event.event_type === 'page_view' && event.session_id)) {
      
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id')
        .eq('id', event.session_id)
        .single();

      if (!existingSession) {
        await supabase
          .from('analytics_sessions')
          .insert({
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}