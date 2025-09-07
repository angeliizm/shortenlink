import { createClient } from '@/lib/supabase/server'
import { PageConfig } from '@/lib/types/page'
import { headers } from 'next/headers'

export async function getPageConfig(slug: string): Promise<PageConfig | null> {
  const supabase = await createClient()
  const headersList = headers()
  const host = headersList.get('host') || ''
  
  // Check if accessing via custom domain first
  if (host && !host.includes('localhost') && !host.includes('vercel')) {
    const { data: domainData } = await supabase.rpc('get_page_by_domain', { 
      hostname: host 
    })
    
    if (domainData) {
      return transformPageData(domainData)
    }
  }
  
  // Otherwise, look up by slug
  const { data, error } = await supabase.rpc('get_page_by_slug', { 
    site_slug: slug 
  })
  
  if (error || !data) {
    return null
  }
  
  return transformPageData(data)
}

function transformPageData(data: any): PageConfig {
  return {
    id: data.id,
    siteSlug: data.site_slug,
    title: data.title,
    brandColor: data.brand_color,
    accentColor: data.accent_color,
    targetUrl: data.target_url,
    meta: data.meta,
    isEnabled: data.is_enabled,
    actions: data.actions || [],
    customDomain: data.custom_domain
  }
}