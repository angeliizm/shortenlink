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

    // Use service role client for invitation codes table access
    const serviceSupabase = createServiceRoleClient()
    
    // Get active invitation codes directly
    const { data: codes, error: listError } = await serviceSupabase
      .from('invitation_codes')
      .select('*')
      .eq('is_used', false)
      .order('created_at', { ascending: false })

    console.log('List codes result:', { codes, listError })

    if (listError) {
      console.log('List error:', listError)
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
