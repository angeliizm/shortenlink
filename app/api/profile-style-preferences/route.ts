import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { siteId, presetId } = await request.json()

    if (!siteId || !presetId) {
      return NextResponse.json(
        { error: 'Site ID and preset ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Upsert profile style preference
    const { error } = await supabase
      .from('profile_style_preferences')
      .upsert({
        site_id: siteId,
        preset_id: presetId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'site_id'
      })

    if (error) {
      console.error('Error saving profile style preference:', error)
      return NextResponse.json(
        { error: 'Failed to save profile style preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in profile style preferences API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('profile_style_preferences')
      .select('preset_id')
      .eq('site_id', siteId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching profile style preference:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile style preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ presetId: data?.preset_id || null })
  } catch (error) {
    console.error('Error in profile style preferences GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
