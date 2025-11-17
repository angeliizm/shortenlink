import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'

interface InvitationCode {
  id: string
  code: string
  site_title: string
  site_slug: string
  is_used: boolean
  expires_at: string | null
  created_by: string
  created_at: string
  used_by: string | null
  used_at: string | null
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== INVITATION CODE USE API CALLED ===')
  
  try {
    // Step 1: Parse request body
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Geçersiz istek gövdesi' },
        { status: 400 }
      )
    }

    const { code } = body
    
    // Step 2: Validate code input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      console.log('Invalid code provided:', code)
      return NextResponse.json(
        { error: 'Davet kodu gereklidir' },
        { status: 400 }
      )
    }

    const normalizedCode = code.trim().toUpperCase()
    console.log('Normalized code:', normalizedCode)

    // Step 3: Get current user using regular client (for auth)
    const authClient = createClient()
    console.log('Getting current user...')
    
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth error or no user:', authError)
      return NextResponse.json(
        { error: 'Doğrulama gerekli' },
        { status: 401 }
      )
    }
    
    console.log('User authenticated:', user.id)

    // Step 4: Use service role client for database operations
    const supabase = createServiceRoleClient()

    // Step 5: Look up the invitation code
    console.log('Looking up invitation code in database...')
    const { data: invitationCode, error: lookupError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single<InvitationCode>()

    console.log('Lookup result:', { 
      found: !!invitationCode, 
      error: lookupError?.message
    })

    // Step 6: Validate code exists
    if (lookupError || !invitationCode) {
      console.log('Code not found:', lookupError)
      return NextResponse.json(
        { error: 'Geçersiz davet kodu' },
        { status: 400 }
      )
    }

    // At this point, TypeScript knows invitationCode is not null/undefined
    console.log('Code found:', {
      code: invitationCode.code,
      is_used: invitationCode.is_used,
      site_slug: invitationCode.site_slug
    })

    // Step 7: Check if code is already used
    if (invitationCode.is_used) {
      console.log('Code already used')
      return NextResponse.json(
        { error: 'Bu davet kodu zaten kullanılmış' },
        { status: 400 }
      )
    }

    // Step 8: Check if code is expired
    if (invitationCode.expires_at) {
      const expiryDate = new Date(invitationCode.expires_at)
      if (expiryDate < new Date()) {
        console.log('Code expired:', invitationCode.expires_at)
        return NextResponse.json(
          { error: 'Bu davet kodunun süresi dolmuş' },
          { status: 400 }
        )
      }
    }

    console.log('Code is valid, proceeding with activation...')

    // Step 9: Update user role to approved
    console.log('Updating user role...')
    const { error: roleUpdateError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'approved',
        assigned_by: invitationCode.created_by,
        assigned_at: new Date().toISOString(),
        notes: `Activated with invitation code: ${normalizedCode}`
      } as any, {
        onConflict: 'user_id'
      }) // TODO: Fix when Supabase types are updated

    if (roleUpdateError) {
      console.error('Failed to update user role:', roleUpdateError)
      return NextResponse.json(
        { error: 'Kullanıcı rolü güncellenemedi' },
        { status: 500 }
      )
    }

    // Step 10: Create or update site page
    console.log('Creating/updating site page...')
    const { error: pageError } = await supabase
      .from('pages')
      .upsert({
        site_slug: invitationCode.site_slug,
        title: invitationCode.site_title || invitationCode.site_slug,
        target_url: 'https://example.com', // Default URL, user can change later
        owner_id: user.id, // User becomes the owner of the site
        is_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any, { // TODO: Fix when Supabase types are updated
        onConflict: 'site_slug'
      })

    if (pageError) {
      console.error('Failed to create/update page:', pageError)
      // Don't fail the whole operation if page creation fails
    }

    // Step 11: Grant site permissions
    console.log('Granting site permissions...')
    const permissions = ['view', 'edit', 'analytics']
    
    for (const permission of permissions) {
      const { error: permError } = await supabase
        .from('site_permissions')
        .upsert({
          user_id: user.id,
          site_slug: invitationCode.site_slug,
          permission_type: permission,
          granted_by: invitationCode.created_by,
          granted_at: new Date().toISOString(),
          is_active: true
        } as any, {
          onConflict: 'user_id,site_slug,permission_type'
        }) // TODO: Fix when Supabase types are updated
      
      if (permError) {
        console.error(`Failed to grant ${permission} permission:`, permError)
        // Continue with other permissions even if one fails
      }
    }

    // Step 12: Mark invitation code as used
    console.log('Marking code as used...')
    const { error: updateError } = await (supabase as any)
      .from('invitation_codes')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', invitationCode.id)

    if (updateError) {
      console.error('Failed to mark code as used:', updateError)
      // Don't fail the operation if we can't mark it as used
      // The user is already approved at this point
    }

    console.log('=== INVITATION CODE SUCCESSFULLY USED ===')
    
    // Step 13: Return success response
    return NextResponse.json({
      success: true,
      message: 'Davet kodu başarıyla etkinleştirildi',
      site_slug: invitationCode.site_slug,
      site_title: invitationCode.site_title
    })

  } catch (unexpectedError) {
    console.error('Unexpected error in invitation code use:', unexpectedError)
    return NextResponse.json(
      { 
        error: 'Beklenmeyen bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? String(unexpectedError) : undefined
      },
      { status: 500 }
    )
  }
}