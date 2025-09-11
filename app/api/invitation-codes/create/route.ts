import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { site_title, site_slug, expires_in } = body

    // Validate input
    if (!site_title || !site_slug) {
      return NextResponse.json(
        { error: 'Site adı ve uzantısı gerekli' },
        { status: 400 }
      )
    }

    // Validate site_slug format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(site_slug)) {
      return NextResponse.json(
        { error: 'Site uzantısı sadece harf, rakam ve tire içerebilir' },
        { status: 400 }
      )
    }

    // Check if site_slug already exists in pages table
    const { data: existingSite } = await supabase
      .from('pages')
      .select('site_slug')
      .eq('site_slug', site_slug)
      .single()

    if (existingSite) {
      return NextResponse.json(
        { error: 'Bu site uzantısı zaten kullanılıyor' },
        { status: 409 }
      )
    }

    // Check if site_slug already exists in invitation_codes table
    const { data: existingCode } = await supabase
      .from('invitation_codes')
      .select('site_slug')
      .eq('site_slug', site_slug)
      .eq('is_used', false)
      .single()

    if (existingCode) {
      return NextResponse.json(
        { error: 'Bu site uzantısı için zaten bir kod mevcut' },
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

    // Generate unique code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_invitation_code')

    if (codeError) {
      throw codeError
    }

    // Create invitation code
    const { data: invitationCode, error: createError } = await (supabase
      .from('invitation_codes') as any)
      .insert({
        code: codeData as string,
        site_title: site_title as string,
        site_slug: site_slug as string,
        expires_at,
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({
      success: true,
      data: invitationCode
    })

  } catch (error) {
    console.error('Error creating invitation code:', error)
    return NextResponse.json(
      { error: 'Kod oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
