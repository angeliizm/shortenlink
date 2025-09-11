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

  // Check user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const userRole = (roleData as any)?.role || 'pending'

  // Verify user can access this site (owner, admin, or moderator)
  let pageQuery = supabase
    .from('pages')
    .select('*')
    .eq('site_slug', params.slug)
  
  if (userRole !== 'admin' && userRole !== 'moderator') {
    pageQuery = pageQuery.eq('owner_id', user.id)
  }
  
  const { data: page } = await pageQuery.single()

  if (!page) {
    redirect('/dashboard')
  }

  return <ModernAnalyticsTemplate siteSlug={params.slug} />
}