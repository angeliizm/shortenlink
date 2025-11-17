import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { sites, expires_in } = body

    // Validate input
    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      return NextResponse.json(
        { error: 'En az bir site bilgisi gerekli' },
        { status: 400 }
      )
    }

    // Validate each site
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      if (!site.title || !site.slug) {
        return NextResponse.json(
          { error: `${i + 1}. site için ad ve uzantısı gerekli` },
          { status: 400 }
        )
      }

      // Validate site_slug format (alphanumeric and hyphens only)
      if (!/^[a-zA-Z0-9-]+$/.test(site.slug)) {
        return NextResponse.json(
          { error: `${i + 1}. site uzantısı sadece harf, rakam ve tire içerebilir` },
          { status: 400 }
        )
      }
    }

    // Check if any site_slug already exists in pages table
    const slugs = sites.map(site => site.slug)
    const { data: existingSites } = await supabase
      .from('pages')
      .select('site_slug')
      .in('site_slug', slugs)

    if (existingSites && existingSites.length > 0) {
      return NextResponse.json(
        { error: `Bu site uzantıları zaten kullanılıyor: ${existingSites.map((s: any) => s.site_slug).join(', ')}` },
        { status: 409 }
      )
    }

    // Use service role client for invitation codes table access
    const serviceSupabase = createServiceRoleClient()
    
    // Check if any site_slug already exists in invitation_codes table
    const { data: existingCodes } = await serviceSupabase
      .from('invitation_codes')
      .select('site_slug')
      .in('site_slug', slugs)
      .eq('is_used', false)

    if (existingCodes && existingCodes.length > 0) {
      return NextResponse.json(
        { error: `Bu site uzantıları için zaten kod mevcut: ${existingCodes.map((c: any) => c.site_slug).join(', ')}` },
        { status: 409 }
      )
    }

    // Calculate expiry date
    let expires_at = null
    if (expires_in && expires_in !== 'never') {
      const now = new Date()
      switch (expires_in) {
        case '1_day':
          expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case '1_week':
          expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case '1_month':
          expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        default:
          expires_at = null
      }
    }

    // Generate unique code manually
    const generatedCode = Math.random().toString(36).substring(2, 14).toUpperCase()
    console.log('Generated code:', generatedCode)

    // Create invitation codes for each site
    const invitationCodes: any[] = []
    for (const site of sites) {
      const { data: invitationCode, error: createError } = await serviceSupabase
        .from('invitation_codes')
        .insert({
          code: generatedCode,
          site_title: site.title,
          site_slug: site.slug,
          expires_at,
          created_by: user.id
        } as any)
        .select()
        .single()

      if (createError) {
        console.log('Create error:', createError)
        throw createError
      }

      console.log('Created invitation code:', invitationCode)
      invitationCodes.push(invitationCode)
    }

    return NextResponse.json({
      success: true,
      data: {
        code: generatedCode,
        sites: invitationCodes
      }
    })

  } catch (error) {
    console.error('Error creating invitation code:', error)
    return NextResponse.json(
      { error: 'Kod oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
