import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServiceRoleClient()
    
    // Get link by slug
    const { data: link, error } = await (supabase
      .from('links') as any)
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 })
    }

    // Check if password is required
    if (link.password) {
      const authHeader = request.headers.get('authorization')
      const providedPassword = authHeader?.replace('Bearer ', '')
      
      if (providedPassword !== link.password) {
        return NextResponse.json(
          { error: 'Password required', requiresPassword: true },
          { status: 401 }
        )
      }
    }

    // Record click (best effort, don't fail if this fails)
    try {
      const headersList = await headers()
      const userAgent = headersList.get('user-agent')
      const referer = headersList.get('referer')
      const ip = headersList.get('x-forwarded-for') || 
                 headersList.get('x-real-ip') || 
                 request.ip || 
                 'unknown'

      await (supabase.from('clicks') as any).insert({
        link_id: link.id,
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
      })
    } catch (clickError) {
      // Log error but don't fail the redirect
      console.error('Failed to record click:', clickError)
    }

    // Perform redirect
    return NextResponse.redirect(link.target_url, {
      status: link.target_url.startsWith('https://') ? 301 : 302,
    })
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}