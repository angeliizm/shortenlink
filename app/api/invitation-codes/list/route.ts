import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // Get active invitation codes with service role client
    const serviceSupabase = createServiceRoleClient()
    const { data: codes, error: listError } = await (serviceSupabase as any)
      .rpc('get_active_invitation_codes')

    if (listError) {
      throw listError
    }

    return NextResponse.json({
      success: true,
      data: codes || []
    })

  } catch (error) {
    console.error('Error listing invitation codes:', error)
    return NextResponse.json(
      { error: 'Kodlar listelenirken hata oluştu' },
      { status: 500 }
    )
  }
}
