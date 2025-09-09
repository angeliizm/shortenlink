import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')

  if (!siteId) {
    return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('title_style_preferences')
    .select('*')
    .eq('site_id', siteId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching title style preference:', error)
    return NextResponse.json({ error: 'Failed to fetch title style preference' }, { status: 500 })
  }

  return NextResponse.json({ preference: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { siteId, presetId, customSettings } = body

  if (!siteId) {
    return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
  }

  // Check if user owns the site
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: site } = await supabase
    .from('pages')
    .select('owner_id')
    .eq('id', siteId)
    .single() as { data: { owner_id: string } | null; error: any }

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  if (site.owner_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // If presetId is empty, delete the preference
  if (!presetId) {
    const { error: deleteError } = await supabase
      .from('title_style_preferences')
      .delete()
      .eq('site_id', siteId)

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error deleting title style preference:', deleteError)
      return NextResponse.json({ error: 'Failed to reset title style' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Title style reset to default' })
  }

  // Upsert the preference
  const { data, error } = await supabase
    .from('title_style_preferences')
    .upsert({
      site_id: siteId,
      preset_id: presetId,
      custom_settings: customSettings || {},
    } as any, {
      onConflict: 'site_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving title style preference:', error)
    return NextResponse.json({ error: 'Failed to save title style preference' }, { status: 500 })
  }

  return NextResponse.json({ success: true, preference: data })
}