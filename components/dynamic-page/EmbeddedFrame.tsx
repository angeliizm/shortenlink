'use client'

import { useEffect, useRef } from 'react'

interface EmbeddedFrameProps {
  url: string
  title: string
  onError: () => void
}

export default function EmbeddedFrame({ url, title, onError }: EmbeddedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const checkIframe = setTimeout(() => {
      if (iframeRef.current) {
        try {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
          if (!doc || doc.location.href === 'about:blank') {
            onError()
          }
        } catch (e) {
          onError()
        }
      }
    }, 3000)

    return () => clearTimeout(checkIframe)
  }, [onError])

  return (
    <iframe
      ref={iframeRef}
      src={url}
      title={title}
      className="w-full h-full"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      onError={onError}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  )
}