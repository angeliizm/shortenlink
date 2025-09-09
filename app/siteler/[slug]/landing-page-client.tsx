'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageConfig } from '@/lib/types/page'
import { motion } from 'framer-motion'
import { getPresetById, defaultPresetId } from '@/lib/button-presets'
import { useAnalytics } from '@/hooks/useAnalytics'
import { BackgroundPicker } from '@/components/background-picker'
import { backgroundPresets, applyPresetControls, type BackgroundPreset } from '@/lib/background-presets'
import { titleStylePresets, getTitleStyles, getDescriptionStyles, getAccentElement } from '@/lib/title-style-presets'
import { Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LandingPageClientProps {
  config: PageConfig
  isOwner?: boolean
}

export default function LandingPageClient({ config, isOwner = false }: LandingPageClientProps) {
  const [mounted, setMounted] = useState(false)
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false)
  const [currentBackground, setCurrentBackground] = useState<{
    preset: BackgroundPreset | null
    controls: Record<string, string | number>
  }>({ preset: null, controls: {} })
  const [previewBackground, setPreviewBackground] = useState<{
    preset: BackgroundPreset | null
    controls: Record<string, string | number>
  } | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [titleStylePreset, setTitleStylePreset] = useState(titleStylePresets[0])
  const { trackPageView, trackActionClick } = useAnalytics()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    // Track page view when component mounts
    if (config.slug) {
      trackPageView(config.slug, window.location.pathname)
    }
    
    // Load Google Fonts for title style
    if (titleStylePreset.preview?.googleFonts) {
      titleStylePreset.preview.googleFonts.forEach(font => {
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      })
    }
    
    // Initialize background preference from server-side data
    if (config.backgroundPreference) {
      const preset = backgroundPresets.find(p => p.id === config.backgroundPreference!.presetId)
      if (preset) {
        setCurrentBackground({
          preset,
          controls: config.backgroundPreference.controlValues
        })
      }
    }
    
    // Initialize title style preference from server-side data
    if (config.titleStylePreference?.presetId) {
      const preset = titleStylePresets.find(p => p.id === config.titleStylePreference!.presetId)
      if (preset) {
        setTitleStylePreset(preset)
      }
    }
    
    // Check motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [config.slug, config.backgroundPreference, config.titleStylePreference, titleStylePreset, trackPageView])


  const handleSaveBackground = async (presetId: string, controls: Record<string, string | number>) => {
    if (!config.id) return
    const response = await fetch('/api/background-preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: config.id,
        presetId,
        controlValues: controls
      })
    })
    if (response.ok) {
      const preset = backgroundPresets.find(p => p.id === presetId)
      if (preset) {
        setCurrentBackground({ preset, controls })
      } else {
        setCurrentBackground({ preset: null, controls: {} })
      }
      setPreviewBackground(null)
    }
  }

  const handlePreviewBackground = useCallback((preset: BackgroundPreset, controls: Record<string, string | number>) => {
    setPreviewBackground({ preset, controls })
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

  // Determine which background to use
  const activeBackground = previewBackground || currentBackground
  let backgroundStyle: React.CSSProperties = {}
  let animationClass = ''
  let animationCSS = ''

  if (activeBackground.preset) {
    backgroundStyle = applyPresetControls(activeBackground.preset, activeBackground.controls)
    if (activeBackground.preset.animation && !prefersReducedMotion) {
      animationClass = `bg-animation-${activeBackground.preset.id}`
      animationCSS = activeBackground.preset.animationCSS || ''
      // Apply animation duration from controls
      const speedControl = activeBackground.controls.speed || activeBackground.controls.waveSpeed || activeBackground.controls.density
      if (speedControl) {
        animationCSS = animationCSS.replace(/\d+s/g, `${speedControl}s`)
      }
    }
  } else {
    // Default background with brand colors
    backgroundStyle = {
      background: `
        radial-gradient(ellipse 1200px 800px at 50% -20%, ${config.brandColor}08 0%, transparent 40%),
        radial-gradient(circle 800px at 100% 100%, ${config.accentColor || '#ffffff'}90 0%, transparent 50%),
        linear-gradient(180deg, ${config.accentColor || '#ffffff'} 0%, ${config.accentColor || '#ffffff'}95 50%, ${config.brandColor}03 100%)
      `
    }
  }

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          .title-styled {
            font-size: ${titleStylePreset.styles.titleFontSizeMobile} !important;
          }
          .description-styled {
            font-size: ${titleStylePreset.styles.descriptionFontSizeMobile} !important;
          }
          .content-container {
            padding: ${titleStylePreset.styles.containerPaddingMobile} !important;
          }
        }
        ${animationCSS || ''}
        ${animationClass ? `.${animationClass} {
          animation-name: ${activeBackground.preset?.animation};
          animation-duration: ${activeBackground.controls.speed || activeBackground.controls.waveSpeed || 15}s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }` : ''}
      `}</style>
      <div 
        className={`min-h-screen relative overflow-hidden ${animationClass}`} 
        style={{
          ...backgroundStyle,
          transition: 'background 0.3s ease-in-out, background-color 0.3s ease-in-out'
        }}
      >
        {/* Premium background elements - only show if using default background */}
        {!activeBackground.preset && (
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
        )}

        {/* Background Picker Button - Only for site owners */}
        {isOwner && (
          <motion.button
            onClick={() => setShowBackgroundPicker(true)}
            className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Palette className="w-5 h-5 text-purple-600" />
          </motion.button>
        )}

      {/* Main Content */}
      <motion.div 
        className="relative z-10 w-full max-w-2xl mx-auto content-container"
        style={{
          padding: titleStylePreset.styles.containerPadding,
          textAlign: titleStylePreset.styles.textAlign,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative">
          {/* Accent Element (if bracket) */}
          {titleStylePreset.styles.accentElement === 'bracket' && getAccentElement(titleStylePreset)}
          
          {/* Title with professional styling */}
          <motion.h1 
            className="title-styled"
            style={getTitleStyles(titleStylePreset)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {config.title}
          </motion.h1>
          
          {/* Accent Element (if underline or dot) */}
          {(titleStylePreset.styles.accentElement === 'underline' || 
            titleStylePreset.styles.accentElement === 'dot') && 
            getAccentElement(titleStylePreset)}
        </div>

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

        {/* Description with professional styling */}
        {config.meta?.description && (
          <motion.p 
            className="description-styled"
            style={getDescriptionStyles(titleStylePreset)}
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
                  onClick={() => {
                    // Track action click
                    if (config.slug) {
                      trackActionClick(config.slug, index, action.label)
                    }
                  }}
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

      {/* Background Picker Modal */}
      {showBackgroundPicker && (
        <BackgroundPicker
          siteId={config.id || ''}
          currentPresetId={currentBackground.preset?.id}
          currentControls={currentBackground.controls}
          onSave={handleSaveBackground}
          onPreview={handlePreviewBackground}
          onClose={() => {
            setShowBackgroundPicker(false)
            setPreviewBackground(null)
          }}
        />
      )}
    </>
  )
}