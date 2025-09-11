import { createClient } from '@/lib/supabase/server'
import { PageConfig } from '@/lib/types/page'
import { headers } from 'next/headers'

export async function getPageConfig(slug: string): Promise<PageConfig | null> {
  const supabase = await createClient()
  const headersList = headers()
  const host = headersList.get('host') || ''
  
  let pageData: any = null
  
  // Check if accessing via custom domain first
  if (host && !host.includes('localhost') && !host.includes('vercel')) {
    const { data: domainData } = await supabase.rpc('get_page_by_domain', { 
      hostname: host 
    } as any)
    
    if (domainData) {
      pageData = domainData
    }
  }
  
  // Otherwise, look up by slug
  if (!pageData) {
    const { data, error } = await supabase.rpc('get_page_by_slug', {
      site_slug: slug
    } as any)
    
    if (error || !data) {
      return null
    }
    
    pageData = data
  }
  
  // Fetch background preferences
  const { data: bgPrefs } = await supabase
    .from('background_preferences')
    .select('*')
    .eq('site_id', pageData.id)
    .single()
  
  // Fetch title style preferences
  const { data: titlePrefs } = await supabase
    .from('title_style_preferences')
    .select('*')
    .eq('site_id', pageData.id)
    .single()
  
  return transformPageData(pageData, bgPrefs, titlePrefs)
}

function transformPageData(data: any, bgPrefs?: any, titlePrefs?: any): PageConfig {
  return {
    id: data.id,
    slug: data.site_slug,  // Added for analytics tracking
    siteSlug: data.site_slug,
    title: data.title,
    targetUrl: data.target_url,
    meta: data.meta,
    isEnabled: data.is_enabled,
    actions: data.actions || [],
    customDomain: data.custom_domain,
    userId: data.user_id,
    avatarUrl: data.avatar_url,
    profilePresetId: data.profile_preset_id,
    titleFontPresetId: data.title_font_preset_id,
    titleColor: data.title_color,
    titleFontSize: data.title_font_size,
    backgroundPreference: bgPrefs ? {
      presetId: bgPrefs.preset_id,
      controlValues: bgPrefs.control_values || {}
    } : null,
    titleStylePreference: titlePrefs ? {
      presetId: titlePrefs.preset_id,
      customSettings: titlePrefs.custom_settings || {}
    } : null
  }
}