import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Verify user owns this site
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: page } = await supabase
      .from('pages')
      .select('owner_id, site_slug')
      .eq('site_slug', slug)
      .single();

    if (!page || page.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch events for export
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('site_slug', slug)
      .order('timestamp', { ascending: false });

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: events } = await query.limit(10000);

    // Create CSV content
    const csvHeaders = [
      'Timestamp',
      'Event Type',
      'Path',
      'Referrer',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Device Type',
      'Browser',
      'OS',
      'Country',
      'Region',
      'Action Index',
      'Action Type',
      'Is Bot',
      'Is New Visitor'
    ];

    const csvRows = events?.map(event => [
      format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      event.event_type,
      event.path || '',
      event.referrer || '',
      event.utm_source || '',
      event.utm_medium || '',
      event.utm_campaign || '',
      event.device_type || '',
      event.browser || '',
      event.os || '',
      event.country || '',
      event.region || '',
      event.action_index?.toString() || '',
      event.action_type || '',
      event.is_bot ? 'Yes' : 'No',
      event.is_new_visitor ? 'Yes' : 'No'
    ]) || [];

    // Combine headers and rows
    const csvContent = [
      csvHeaders,
      ...csvRows
    ].map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = cell.replace(/"/g, '""');
      return cell.includes(',') || cell.includes('"') || cell.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    }).join(',')).join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${slug}-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}