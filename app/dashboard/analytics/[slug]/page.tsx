import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
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

  return (
    <div className="container mx-auto py-8 px-4">
      <AnalyticsDashboard siteSlug={params.slug} />
    </div>
  )
}