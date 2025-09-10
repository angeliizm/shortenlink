import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModernAnalyticsTemplate from '@/components/analytics/ModernAnalyticsTemplate'

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Verify user owns this site
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('site_slug', params.slug)
    .eq('owner_id', user.id)
    .single()

  if (!page) {
    redirect('/dashboard')
  }

  return <ModernAnalyticsTemplate siteSlug={params.slug} />
}