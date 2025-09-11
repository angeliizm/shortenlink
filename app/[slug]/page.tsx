import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPageConfig } from '@/lib/supabase/pages'
import LandingPageClient from './landing-page-client'

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
    // Profil fotoğrafını favicon olarak kullan
    icons: config.avatarUrl ? {
      icon: config.avatarUrl,
      shortcut: config.avatarUrl,
      apple: config.avatarUrl,
    } : undefined,
    openGraph: {
      title: config.title,
      description: config.meta?.description,
      type: 'website',
      // Profil fotoğrafını Open Graph image olarak da kullan
      images: config.avatarUrl ? [config.avatarUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.meta?.description,
      // Profil fotoğrafını Twitter image olarak da kullan
      images: config.avatarUrl ? [config.avatarUrl] : undefined,
    }
  }
}

export default async function Page({ params }: PageProps) {
  const config = await getPageConfig(params.slug)
  
  if (!config) {
    // Redirect to home page instead of showing 404
    redirect('/')
  }

  // No authentication required - public access
  return <LandingPageClient config={config} isOwner={false} />
}