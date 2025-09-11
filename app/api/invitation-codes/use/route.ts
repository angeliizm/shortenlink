import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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
    const { code } = body

    // Validate input
    if (!code) {
      return NextResponse.json(
        { error: 'Kod gerekli' },
        { status: 400 }
      )
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1'

    // Use service role client for invitation codes table access
    const serviceSupabase = createServiceRoleClient()
    
    // Use the invitation code manually (without RPC)
    console.log('Looking for code:', code.toUpperCase())
    
    const { data: invitationCode, error: codeError } = await serviceSupabase
      .from('invitation_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_used', false)
      .single()

    console.log('Code query result:', { invitationCode, codeError })

    if (codeError || !invitationCode) {
      console.log('Code not found or error:', codeError)
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş kod', debug: { code: code.toUpperCase(), error: codeError?.message } },
        { status: 400 }
      )
    }

    // Check if code is expired
    if ((invitationCode as any).expires_at && new Date((invitationCode as any).expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Kod süresi dolmuş' },
        { status: 400 }
      )
    }

    // Update user role to approved
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'approved',
        assigned_by: (invitationCode as any).created_by,
        notes: 'Invitation code ile onaylandı'
      } as any)

    if (roleError) {
      throw roleError
    }

    // Create site if it doesn't exist
    const { error: siteError } = await supabase
      .from('pages')
      .upsert({
        site_slug: (invitationCode as any).site_slug,
        title: (invitationCode as any).site_title,
        owner_id: (invitationCode as any).created_by,
        is_enabled: true
      } as any, { onConflict: 'site_slug' })

    if (siteError) {
      throw siteError
    }

    // Grant permissions
    const permissions = ['view', 'edit', 'analytics']
    for (const permission of permissions) {
      await supabase
        .from('site_permissions')
        .upsert({
          user_id: user.id,
          site_slug: (invitationCode as any).site_slug,
          permission_type: permission,
          granted_by: (invitationCode as any).created_by,
          is_active: true
        } as any, { onConflict: 'user_id,site_slug,permission_type' })
    }

    // Mark code as used
    await serviceSupabase
      .from('invitation_codes')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', (invitationCode as any).id)

    return NextResponse.json({
      success: true,
      message: 'Kod başarıyla kullanıldı. Site erişiminiz aktif edildi.',
      site_slug: (invitationCode as any).site_slug,
      site_title: (invitationCode as any).site_title
    })

  } catch (error) {
    console.error('Error using invitation code:', error)
    return NextResponse.json(
      { error: 'Kod kullanılırken hata oluştu' },
      { status: 500 }
    )
  }
}
