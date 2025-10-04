'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageConfig } from '@/lib/types/page'
import { motion, AnimatePresence } from 'framer-motion'
import { getPresetById, defaultPresetId } from '@/lib/button-presets'
import { getProfilePresetById, defaultProfilePresetId } from '@/lib/profile-presets'
import { getTitleFontPresetById, defaultTitleFontPresetId } from '@/lib/title-font-presets'
import { useAnalytics } from '@/hooks/useAnalytics'
import { BackgroundPicker } from '@/components/background-picker'
import { backgroundPresets, applyPresetControls, type BackgroundPreset } from '@/lib/background-presets'
import { titleStylePresets, getTitleStyles, getDescriptionStyles, getAccentElement, type TitleStylePreset } from '@/lib/title-style-presets'
import { Palette, Sparkles, ArrowRight } from 'lucide-react'
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
  // Initialize from config first, then localStorage will override if needed
  const [profilePresetId, setProfilePresetId] = useState<string>(config.profilePresetId || defaultProfilePresetId)
  const [titleFontPresetId, setTitleFontPresetId] = useState<string>(config.titleFontPresetId || defaultTitleFontPresetId)
  const [titleColor, setTitleColor] = useState<string>(config.titleColor || '#1f2937')
  const [titleFontSize, setTitleFontSize] = useState<number>(config.titleFontSize || 28)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  
  // Listen for preset changes from edit page (if same site)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `profile-preset-${config.id}` && e.newValue && getProfilePresetById(e.newValue)) {
        setProfilePresetId(e.newValue)
      }
      if (e.key === `title-font-preset-${config.id}` && e.newValue && getTitleFontPresetById(e.newValue)) {
        setTitleFontPresetId(e.newValue)
      }
      if (e.key === `title-color-${config.id}` && e.newValue) {
        setTitleColor(e.newValue)
      }
      if (e.key === `title-font-size-${config.id}` && e.newValue) {
        setTitleFontSize(parseInt(e.newValue) || 28)
      }
      if (e.key === `avatar-url-${config.id}` && e.newValue) {
        setAvatarUrl(e.newValue)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [config.id])
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

  // Load preferences: database values take priority, then localStorage, then defaults
  useEffect(() => {
    if (config.id) {
      // Profile preset: check database first via config
      if (config.profilePresetId) {
        setProfilePresetId(config.profilePresetId)
      } else {
        const savedProfilePreset = localStorage.getItem(`profile-preset-${config.id}`)
        if (savedProfilePreset && getProfilePresetById(savedProfilePreset)) {
          setProfilePresetId(savedProfilePreset)
        }
      }
      
      // Title font preset: check database first via config
      if (config.titleFontPresetId) {
        setTitleFontPresetId(config.titleFontPresetId)
      } else {
        const savedTitleFontPreset = localStorage.getItem(`title-font-preset-${config.id}`)
        if (savedTitleFontPreset && getTitleFontPresetById(savedTitleFontPreset)) {
          setTitleFontPresetId(savedTitleFontPreset)
        }
      }

      // Title color: check database first via config
      if (config.titleColor) {
        setTitleColor(config.titleColor)
      } else {
        const savedTitleColor = localStorage.getItem(`title-color-${config.id}`)
        if (savedTitleColor) {
          setTitleColor(savedTitleColor)
        }
      }

      // Title font size: check database first via config
      if (config.titleFontSize) {
        setTitleFontSize(config.titleFontSize)
      } else {
        const savedTitleFontSize = localStorage.getItem(`title-font-size-${config.id}`)
        if (savedTitleFontSize) {
          setTitleFontSize(parseInt(savedTitleFontSize) || 28)
        }
      }

      // Avatar URL: database takes priority
      if (config.avatarUrl) {
        setAvatarUrl(config.avatarUrl)
        // Sync to localStorage for offline access
        localStorage.setItem(`avatar-url-${config.id}`, config.avatarUrl)
      } else {
        const savedAvatarUrl = localStorage.getItem(`avatar-url-${config.id}`)
        if (savedAvatarUrl) {
          setAvatarUrl(savedAvatarUrl)
        } else {
          // Clear avatar URL if no saved value
          setAvatarUrl('')
        }
      }
    }
  }, [config.id, config.avatarUrl, config.profilePresetId, config.titleFontPresetId, config.titleColor])


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


  // Determine which background to use
  const activeBackground = previewBackground || currentBackground
  let backgroundStyle: React.CSSProperties = {}
  let animationClass = ''
  let animationCSS = ''
  
  // Get title styles for responsive CSS
  const currentTitleStylePreset = titleStylePresets.find(p => p.id === titleFontPresetId) || titleStylePresets.find(p => p.id === defaultTitleFontPresetId)!
  const titleStyles = currentTitleStylePreset.styles
  
  // Get title font preset for color and font
  const titleFontPreset = getTitleFontPresetById(titleFontPresetId) || getTitleFontPresetById(defaultTitleFontPresetId)!
  
  // Get profile styles for responsive CSS
  const profilePreset = getProfilePresetById(profilePresetId) || getProfilePresetById(defaultProfilePresetId)!
  const styles = profilePreset.styles

  if (activeBackground.preset) {
    backgroundStyle = applyPresetControls(activeBackground.preset, activeBackground.controls)
    // Animations disabled - no animation class or CSS
    animationClass = ''
    animationCSS = ''
  } else {
    // Default background with neutral colors
    backgroundStyle = {
      background: `
        radial-gradient(ellipse 1200px 800px at 50% -20%, #3B82F608 0%, transparent 40%),
        radial-gradient(circle 800px at 100% 100%, #ffffff90 0%, transparent 50%),
        linear-gradient(180deg, #ffffff 0%, #ffffff95 50%, #3B82F603 100%)
      `
    }
  }

  return (
    <>
       <style jsx global>{`
         * {
           -webkit-font-smoothing: antialiased;
           -moz-osx-font-smoothing: grayscale;
           font-family: 'Helvetica', 'Arial', sans-serif;
         }
        
        
        .title-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 100%);
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .title-shadow {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1),
                       0 5px 20px rgba(0, 0, 0, 0.05),
                       0 8px 40px rgba(0, 0, 0, 0.03);
        }
        
        .description-balance {
          text-wrap: balance;
        }
        
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .button-shine {
          position: relative;
          overflow: hidden;
        }
        
        .button-shine::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        
        .button-shine:hover::before {
          transform: translateX(100%);
        }
        
        @keyframes rotate-dash {
          0% {
            border-style: dashed;
            border-dasharray: 12px 6px;
            border-dashoffset: 0;
          }
          100% {
            border-style: dashed;
            border-dasharray: 12px 6px;
            border-dashoffset: 18px;
          }
        }
        
        /* Responsive font sizes */
        .responsive-title {
          font-size: ${titleFontSize}px !important;
          color: ${config.titleColor || titleColor || '#111827'} !important;
          font-family: ${titleFontPreset?.fontFamily || 'Inter, sans-serif'} !important;
          font-weight: ${titleFontPreset?.fontWeight || '600'} !important;
          letter-spacing: ${titleFontPreset?.letterSpacing || '-0.02em'} !important;
          line-height: ${titleStyles?.titleLineHeight || '1.1'} !important;
          text-align: ${titleStyles?.textAlign || 'center'} !important;
          margin: ${styles.titleMargin || '0'} !important;
        }
        
        .responsive-description {
          font-size: ${titleStyles?.descriptionFontSize || '1.125rem'} !important;
          color: ${titleStyles?.descriptionColor || '#6b7280'} !important;
          font-family: ${titleStyles?.descriptionFontFamily || 'Inter, sans-serif'} !important;
          font-weight: ${titleStyles?.descriptionFontWeight || '400'} !important;
          letter-spacing: ${titleStyles?.descriptionLetterSpacing || '0'} !important;
          line-height: ${titleStyles?.descriptionLineHeight || '1.6'} !important;
          text-align: ${titleStyles?.textAlign || 'center'} !important;
          margin: ${styles.descriptionMargin || '0'} !important;
          max-width: ${titleStyles?.descriptionMaxWidth || '100%'} !important;
        }
        
        @media (max-width: 768px) {
          .responsive-title {
            font-size: ${Math.max(titleFontSize * 0.7, 20)}px !important;
          }
          
          .responsive-description {
            font-size: ${titleStyles?.descriptionFontSizeMobile || '1rem'} !important;
            color: ${titleStyles?.descriptionColor || '#6b7280'} !important;
            font-family: ${titleStyles?.descriptionFontFamily || 'Inter, sans-serif'} !important;
          }
        }
        
        ${animationCSS || ''}
        ${animationClass ? `.${animationClass} {
          animation-name: ${activeBackground.preset?.animation};
          animation-duration: ${activeBackground.controls.speed || 
                              activeBackground.controls.waveSpeed || 
                              activeBackground.controls.mistSpeed ||
                              activeBackground.controls.glowSpeed ||
                              activeBackground.controls.pulseSpeed ||
                              activeBackground.controls.sparkleSpeed ||
                              activeBackground.controls.rainSpeed ||
                              activeBackground.controls.lightningSpeed ||
                              activeBackground.controls.shiftSpeed ||
                              activeBackground.controls.breathingSpeed ||
                              15}s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }` : ''}
      `}</style>
      <div 
        className={`min-h-screen relative overflow-hidden ${animationClass}`} 
        style={{
          ...backgroundStyle,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '30px'
        }}
      >
        {/* Enhanced background elements */}
        {!activeBackground.preset && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Animated gradient orbs */}
            <motion.div 
              className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, #3B82F608 0%, transparent 50%)`,
                filter: 'blur(40px)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, #3B82F612 0%, transparent 60%)`,
                filter: 'blur(60px)',
                opacity: 0.4
              }}
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 30, 0],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Modern mesh gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(at 20% 80%, #3B82F606 0%, transparent 50%),
                  radial-gradient(at 80% 20%, #ffffff05 0%, transparent 50%),
                  radial-gradient(at 40% 40%, #3B82F604 0%, transparent 50%)
                `,
                filter: 'blur(100px) saturate(150%)'
              }}
            />
            {/* Subtle noise texture */}
            <div 
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
              }}
            />
          </div>
        )}

        {/* Enhanced Background Picker Button */}
        {isOwner && (
          <motion.button
            onClick={() => setShowBackgroundPicker(true)}
            className="fixed top-6 right-6 z-20 p-3.5 glass-effect rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Palette className="w-5 h-5 text-purple-600 transition-transform group-hover:rotate-12" />
              <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        )}

      {/* Profile Card - Dynamic Preset Design */}
      {(() => {
        
        // Create styles for the container
        const containerStyles = {
          padding: styles.containerPadding,
          borderRadius: styles.containerBorderRadius,
          background: styles.containerBackground,
          border: styles.containerBorder,
          boxShadow: styles.containerShadow
        }
        
        return (
          <motion.div 
              className="relative z-10 w-full max-w-md mx-auto mb-8"
              style={{
                margin: '0 auto 30px auto'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
            <div className="relative">
              {/* Profile Card Container */}
              <div 
                className="relative overflow-hidden text-center w-full"
                style={containerStyles}
              >
                 {/* Profile Avatar */}
                 <motion.div 
                   className="relative mx-auto overflow-hidden"
                   style={{
                     width: styles.avatarSize,
                     height: styles.avatarSize,
                     borderRadius: styles.avatarBorderRadius,
                     border: styles.avatarBorder,
                     boxShadow: styles.avatarShadow,
                     background: styles.avatarBackground,
                     marginBottom: '16px',
                     display: 'block',
                     visibility: 'visible',
                     position: 'relative',
                     zIndex: 10
                   }}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                 >
                   {avatarUrl ? (
                     <img
                       src={avatarUrl}
                       alt="Profile Avatar"
                       className="w-full h-full object-cover"
                       loading="eager"
                       crossOrigin="anonymous"
                       style={{
                         display: 'block',
                         visibility: 'visible',
                         width: '100%',
                         height: '100%',
                         objectFit: 'cover',
                         borderRadius: '50%'
                       }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <svg 
                         className="w-8 h-8 text-white" 
                         fill="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                       </svg>
                     </div>
                   )}
                 </motion.div>

                {/* Name/Title */}
                {(() => {
                  const titleFontPreset = getTitleFontPresetById(titleFontPresetId) || getTitleFontPresetById(defaultTitleFontPresetId)!
                  
                  return (
                    <motion.h1 
                      className="responsive-title"
                      style={{ 
                        fontSize: `${titleFontSize}px`,
                        fontWeight: titleFontPreset.fontWeight,
                        color: config.titleColor || titleColor || '#111827',
                        margin: styles.titleMargin,
                        letterSpacing: titleFontPreset.letterSpacing,
                        fontFamily: titleFontPreset.fontFamily,
                        lineHeight: titleStyles.titleLineHeight,
                        textAlign: titleStyles.textAlign
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {config.title}
                    </motion.h1>
                  )
                })()}

                {/* Description */}
                {config.meta?.description && (
                  <motion.p 
                    className="responsive-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {config.meta.description}
                  </motion.p>
                )}

                {/* Decorative Elements */}
                {styles.showDecorativeElements && (
                  <>
                    <div 
                      className="absolute top-4 right-4 rounded-full opacity-60" 
                      style={{ 
                        width: styles.decorativeSize,
                        height: styles.decorativeSize,
                        backgroundColor: styles.decorativeColor 
                      }} 
                    />
                    <div 
                      className="absolute bottom-4 left-4 rounded-full opacity-40" 
                      style={{ 
                        width: `${parseInt(styles.decorativeSize) / 2}px`,
                        height: `${parseInt(styles.decorativeSize) / 2}px`,
                        backgroundColor: styles.decorativeColor 
                      }} 
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )
      })()}

      {/* Enhanced Main Content Container */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-auto px-4"
        style={{
          textAlign: titleStylePreset.styles.textAlign,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {/* Content area - now simplified since title is in profile card */}


        {/* Premium Enhanced Description with SEO focus */}
        {config.meta?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 relative"
          >
            {/* Description container with glass effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              
              <p 
                className="description-styled leading-relaxed description-balance relative z-10 text-gray-600"
                 style={{
                   ...getDescriptionStyles(titleStylePreset),
                   fontFamily: 'Helvetica, Arial, sans-serif',
                   fontSize: `clamp(1rem, 2vw, ${titleStylePreset.styles.descriptionFontSize})`,
                   maxWidth: '650px',
                   margin: '0 auto',
                   lineHeight: '1.8',
                   letterSpacing: '0.01em',
                   fontWeight: 450
                 }}
              >
                {/* Highlight first sentence for SEO emphasis */}
                {config.meta?.description?.split('. ').map((sentence, index) => (
                  <motion.span
                    key={index}
                    className={index === 0 ? 'font-medium text-gray-700' : ''}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3 + index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {sentence}{index < (config.meta?.description?.split('. ').length || 0) - 1 ? '. ' : ''}
                  </motion.span>
                ))}
              </p>
            </div>
            
            {/* SEO Keywords visualization (subtle) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-2 justify-center mt-6"
            >
              {/* Extract and display key phrases */}
              {config.meta?.description?.split(' ').slice(0, 3).map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full border border-purple-100 opacity-60"
                >
                  {word}
                </span>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Action Buttons Container */}
        {sortedActions.length > 0 && (
          <motion.div 
            className="w-full mx-auto"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(8px, 1rem, 16px)'
            }}
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
                     relative block w-full text-center font-semibold
                     transition-all duration-300 ease-out overflow-visible
                     ${action.description ? 'py-6 px-6' : 'py-5 px-6'} rounded-xl
                     hover:shadow-xl hover:shadow-purple-200/30
                     transform-gpu
                     group
                     min-h-[90px]
                   `}
                   style={{
                     backgroundColor: styles.gradient ? 'transparent' : styles.backgroundColor,
                     backgroundImage: styles.gradient ? styles.backgroundColor : 'none',
                     color: styles.color,
                     borderColor: 'transparent',
                     borderWidth: '0px',
                     borderStyle: 'none',
                     borderRadius: '12px',
                     fontSize: '16px',
                     letterSpacing: '-0.01em',
                     position: 'relative',
                     isolation: 'isolate',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                     fontFamily: 'Helvetica, Arial, sans-serif'
                   }}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.3 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Track action click
                    if (config.slug) {
                      trackActionClick(config.slug, index, action.label)
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (styles.hoverBackgroundColor) {
                      if (preset.styles.gradient) {
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
                    // Kenarlık yok
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                    e.currentTarget.style.boxShadow = styles.shadow ? `${styles.shadow}, 0 10px 25px -5px rgba(0, 0, 0, 0.15)` : `0 10px 25px -5px ${styles.color}40, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
                    // Update dashed border opacity for all buttons
                    const dashedBorder = e.currentTarget.querySelector('.dashed-border-static') as HTMLElement
                    if (dashedBorder) {
                      dashedBorder.style.opacity = '1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preset.styles.gradient) {
                      e.currentTarget.style.backgroundImage = styles.backgroundColor
                      e.currentTarget.style.backgroundColor = 'transparent'
                    } else {
                      e.currentTarget.style.backgroundColor = styles.backgroundColor
                      e.currentTarget.style.backgroundImage = 'none'
                    }
                    e.currentTarget.style.color = styles.color
                    // Kenarlık yok
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = styles.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    // Reset dashed border opacity for all buttons
                    const dashedBorder = e.currentTarget.querySelector('.dashed-border-static') as HTMLElement
                    if (dashedBorder) {
                      dashedBorder.style.opacity = '0.5'
                    }
                  }}
                >
                  {/* Responsive dashed border */}
                  <span 
                    className="absolute rounded-2xl pointer-events-none dashed-border-static"
                    style={{
                      inset: '-6px',
                      border: '2px dashed #E5E7EB',
                      opacity: 0.5,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Animated dashed border on hover */}
                  <span 
                    className="absolute rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100"
                    style={{
                      inset: '-6px',
                      border: '2px dashed #E5E7EB',
                      animation: 'rotate-dash 8s linear infinite',
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  
                  {/* Button content with centered logo at top */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-full gap-2">
                    {/* Logo at the top - centered */}
                    {config.logoUrl && (
                      <div className="min-w-[80px] min-h-[80px] max-w-[120px] max-h-[120px] flex items-center justify-center bg-black backdrop-blur-md rounded-2xl border border-gray-900 shadow-2xl group-hover:bg-gray-900 group-hover:scale-110 transition-all duration-500 relative overflow-hidden p-3">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <img
                          src={config.logoUrl}
                          alt="Logo"
                          className="max-w-full max-h-full w-auto h-auto object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Buton fotoğrafı - centered below logo */}
                    {action.image_url && (
                      <div className="min-w-[48px] min-h-[48px] max-w-[60px] max-h-[60px] flex items-center justify-center bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-sm rounded-xl border border-white/35 shadow-lg group-hover:from-white/35 group-hover:to-white/25 group-hover:scale-105 transition-all duration-300 p-2">
                        <img
                          src={action.image_url}
                          alt={action.label}
                          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Varsayılan ikon (fotoğraf yoksa) */}
                    {!action.image_url && (
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-sm rounded-xl border border-white/35 shadow-lg group-hover:from-white/35 group-hover:to-white/25 group-hover:scale-105 transition-all duration-300">
                        <svg 
                          className="w-6 h-6 group-hover:scale-105 transition-transform duration-300" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                    
                    {/* Text content - centered */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-semibold text-lg group-hover:scale-105 transition-transform duration-300">{action.label}</span>
                      {action.description && (
                        <span className="text-sm opacity-90 font-normal max-w-[250px] text-center leading-tight mt-1 group-hover:opacity-100 transition-opacity duration-300">
                          {action.description}
                        </span>
                      )}
                    </div>
                    
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </motion.div>
      
      {/* Footer - Inside main container */}
      <motion.footer 
        className="relative z-10 w-full max-w-md mx-auto px-4 py-3 mt-6"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <p className="text-xs text-white opacity-70">
            Linkfy. bir Deniz Aksoy Medya projesidir.
          </p>
        </div>
      </motion.footer>
      </div>

      {/* Enhanced Background Picker Modal with Animation */}
      <AnimatePresence>
        {showBackgroundPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
