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

    // Use the invitation code with service role client
    const serviceSupabase = createServiceRoleClient()
    const { data: result, error: useError } = await (serviceSupabase as any)
      .rpc('use_invitation_code', {
        p_code: code.toUpperCase(),
        p_user_id: user.id,
        p_ip_address: ip
      })

    if (useError) {
      throw useError
    }

    // Parse the result (it's a JSON string from the function)
    const parsedResult = typeof result === 'string' ? JSON.parse(result) : result

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: parsedResult.error, blocked_until: parsedResult.blocked_until },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: parsedResult.message,
      site_slug: parsedResult.site_slug,
      site_title: parsedResult.site_title
    })

  } catch (error) {
    console.error('Error using invitation code:', error)
    return NextResponse.json(
      { error: 'Kod kullanılırken hata oluştu' },
      { status: 500 }
    )
  }
}
