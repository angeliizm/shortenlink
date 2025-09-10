'use client'

import { useState, useEffect } from 'react'
import { PageConfig } from '@/lib/types/page'
import TopBar from '@/components/dynamic-page/TopBar'
import EmbeddedFrame from '@/components/dynamic-page/EmbeddedFrame'
import FallbackCard from '@/components/dynamic-page/FallbackCard'
import LoadingSpinner from '@/components/dynamic-page/LoadingSpinner'

interface PageClientProps {
  config: PageConfig
}

export default function PageClient({ config }: PageClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [embedBlocked, setEmbedBlocked] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9fafb' }}>
      <TopBar 
        title={config.title}
        brandColor="#3B82F6"
        actions={config.actions}
      />
      
      <main className="flex-1 relative">
        {!embedBlocked ? (
          <EmbeddedFrame 
            url={config.targetUrl}
            title={config.title}
            onError={() => setEmbedBlocked(true)}
          />
        ) : (
          <FallbackCard 
            title={config.title}
            targetUrl={config.targetUrl}
            actions={config.actions}
            brandColor="#3B82F6"
          />
        )}
      </main>
    </div>
  )
}