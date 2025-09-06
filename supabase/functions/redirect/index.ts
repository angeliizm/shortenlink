import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const slug = pathParts[pathParts.length - 1]
    const domain = req.headers.get('host') || 'localhost'

    if (!slug) {
      return new Response('Slug not provided', { status: 400 })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the link
    const { data: domainData, error: domainError } = await supabaseClient
      .from('domains')
      .select('id')
      .eq('domain', domain)
      .single()

    if (domainError || !domainData) {
      return new Response('Domain not found', { status: 404 })
    }

    const { data: link, error: linkError } = await supabaseClient
      .from('links')
      .select('*')
      .eq('domain_id', domainData.id)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (linkError || !link) {
      return new Response('Link not found', { status: 404 })
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new Response('Link has expired', { status: 410 })
    }

    // Check click limit
    if (link.click_limit && link.total_clicks >= link.click_limit) {
      return new Response('Click limit reached', { status: 410 })
    }

    // Check if it's a one-time link that has been used
    if (link.one_time && link.total_clicks > 0) {
      return new Response('One-time link already used', { status: 410 })
    }

    // Get client info
    const userAgent = req.headers.get('user-agent') || ''
    const acceptLanguage = req.headers.get('accept-language') || ''
    const referrer = req.headers.get('referer') || ''
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || ''

    // Hash the IP for privacy
    const encoder = new TextEncoder()
    const data = encoder.encode(ip)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Record the click
    const { error: clickError } = await supabaseClient
      .from('clicks')
      .insert({
        link_id: link.id,
        ip_hash: ipHash,
        user_agent: userAgent,
        accept_language: acceptLanguage,
        referrer: referrer,
        // Add device detection and geo info here if needed
      })

    if (clickError) {
      console.error('Error recording click:', clickError)
    }

    // Update link statistics
    const { error: updateError } = await supabaseClient
      .from('links')
      .update({
        total_clicks: link.total_clicks + 1,
        last_clicked_at: new Date().toISOString(),
      })
      .eq('id', link.id)

    if (updateError) {
      console.error('Error updating link stats:', updateError)
    }

    // Build target URL with UTM parameters if present
    let targetUrl = link.target_url
    const utmParams = new URLSearchParams()
    
    if (link.utm_source) utmParams.append('utm_source', link.utm_source)
    if (link.utm_medium) utmParams.append('utm_medium', link.utm_medium)
    if (link.utm_campaign) utmParams.append('utm_campaign', link.utm_campaign)
    if (link.utm_term) utmParams.append('utm_term', link.utm_term)
    if (link.utm_content) utmParams.append('utm_content', link.utm_content)

    if (utmParams.toString()) {
      const separator = targetUrl.includes('?') ? '&' : '?'
      targetUrl = `${targetUrl}${separator}${utmParams.toString()}`
    }

    // Return redirect response
    return new Response(null, {
      status: link.redirect_type === '301' ? 301 : 302,
      headers: {
        ...corsHeaders,
        'Location': targetUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error in redirect function:', error)
    return new Response('Internal server error', { status: 500 })
  }
})