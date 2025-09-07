'use client'

import { useState, useEffect } from 'react'
import { PageConfig } from '@/lib/types/page'
import { motion } from 'framer-motion'
import { getPresetById, defaultPresetId } from '@/lib/button-presets'

interface LandingPageClientProps {
  config: PageConfig
}

export default function LandingPageClient({ config }: LandingPageClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Filter enabled actions and render in stored order only
  const enabledActions = config.actions?.filter(a => a.isEnabled) || []
  const sortedActions = enabledActions.sort((a, b) => a.sortOrder - b.sortOrder)

  // Extract text from URL format if needed
  let displayText = ''
  if (config.targetUrl === 'https://placeholder.empty') {
    displayText = ''
  } else if (config.targetUrl.startsWith('https://text/')) {
    displayText = decodeURIComponent(config.targetUrl.replace('https://text/', ''))
  } else if (config.targetUrl && config.targetUrl !== '') {
    displayText = config.targetUrl
  }

  // Premium background with brand colors
  const backgroundStyle = {
    background: `
      radial-gradient(ellipse 1200px 800px at 50% -20%, ${config.brandColor}08 0%, transparent 40%),
      radial-gradient(circle 800px at 100% 100%, ${config.accentColor || '#ffffff'}90 0%, transparent 50%),
      linear-gradient(180deg, ${config.accentColor || '#ffffff'} 0%, ${config.accentColor || '#ffffff'}95 50%, ${config.brandColor}03 100%)
    `
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
      {/* Premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient rings */}
        <div 
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${config.brandColor}06 0%, transparent 50%)`,
            filter: 'blur(40px)'
          }}
        />
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ 
            background: `radial-gradient(circle, ${config.brandColor}10 0%, transparent 60%)`,
            filter: 'blur(60px)'
          }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(${config.brandColor} 1px, transparent 1px),
              linear-gradient(90deg, ${config.brandColor} 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-20 md:pt-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Title with refined spacing */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center"
          style={{ 
            color: config.brandColor,
            lineHeight: '1.1'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {config.title}
        </motion.h1>

        {/* Display text - closer to title */}
        {displayText && (
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-700 text-center mt-4 mb-3 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {displayText}
          </motion.p>
        )}

        {/* Description with tighter spacing */}
        {config.meta?.description && (
          <motion.p 
            className="text-base md:text-lg text-gray-500 text-center max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {config.meta.description}
          </motion.p>
        )}

        {/* Action Buttons - Vertical Stack */}
        {sortedActions.length > 0 && (
          <motion.div 
            className="w-full max-w-md mx-auto mt-12 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {sortedActions.map((action, index) => {
              // Get preset or use default
              const preset = getPresetById(action.preset || defaultPresetId) || getPresetById(defaultPresetId)!
              const styles = preset.styles
              
              // Handle gradients and regular colors
              const backgroundStyle = styles.backgroundColor.includes('gradient') 
                ? { backgroundImage: styles.backgroundColor }
                : { backgroundColor: styles.backgroundColor }
              
              const hoverBackgroundStyle = styles.hoverBackgroundColor?.includes('gradient')
                ? { backgroundImage: styles.hoverBackgroundColor }
                : { backgroundColor: styles.hoverBackgroundColor }
              
              return (
                <motion.a
                  key={action.id || index}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    relative block w-full text-center font-medium
                    transition-all duration-300 ease-out overflow-hidden
                    py-3.5 px-6 rounded-xl
                    hover:shadow-lg
                  `}
                  style={{
                    ...backgroundStyle,
                    color: styles.color,
                    border: styles.borderWidth ? `${styles.borderWidth} solid ${styles.borderColor || 'transparent'}` : 'none',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.3 + index * 0.05,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    if (styles.hoverBackgroundColor) {
                      if (styles.hoverBackgroundColor.includes('gradient')) {
                        e.currentTarget.style.backgroundImage = styles.hoverBackgroundColor
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else {
                        e.currentTarget.style.backgroundColor = styles.hoverBackgroundColor
                        e.currentTarget.style.backgroundImage = 'none'
                      }
                    }
                    if (styles.hoverTextColor) {
                      e.currentTarget.style.color = styles.hoverTextColor
                    }
                    if (styles.hoverBorderColor && styles.borderWidth) {
                      e.currentTarget.style.borderColor = styles.hoverBorderColor
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (styles.backgroundColor.includes('gradient')) {
                      e.currentTarget.style.backgroundImage = styles.backgroundColor
                      e.currentTarget.style.backgroundColor = 'transparent'
                    } else {
                      e.currentTarget.style.backgroundColor = styles.backgroundColor
                      e.currentTarget.style.backgroundImage = 'none'
                    }
                    e.currentTarget.style.color = styles.color
                    if (styles.borderColor && styles.borderWidth) {
                      e.currentTarget.style.borderColor = styles.borderColor
                    }
                  }}
                >
                  <span className="relative z-10">{action.label}</span>
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}