import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageConfig } from '@/lib/supabase/pages'
import LandingPageClient from './landing-page-client'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = await getPageConfig(params.slug)
  
  if (!config) {
    return {
      title: 'Sayfa Bulunamadı',
      robots: 'noindex'
    }
  }

  return {
    title: config.title,
    description: config.meta?.description,
    robots: config.meta?.noindex ? 'noindex' : 'index,follow',
    openGraph: {
      title: config.title,
      description: config.meta?.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.meta?.description,
    }
  }
}

export default async function Page({ params }: PageProps) {
  const config = await getPageConfig(params.slug)
  
  if (!config) {
    notFound()
  }

  // Check if current user is the owner
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === config.userId

  return <LandingPageClient config={config} isOwner={isOwner} />
}