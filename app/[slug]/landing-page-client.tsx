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
import { titleStylePresets, getTitleStyles, getDescriptionStyles, getAccentElement } from '@/lib/title-style-presets'
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
  const [profilePresetId, setProfilePresetId] = useState<string>(defaultProfilePresetId)
  const [titleFontPresetId, setTitleFontPresetId] = useState<string>(defaultTitleFontPresetId)
  const [titleColor, setTitleColor] = useState<string>('#1f2937')
  const [avatarUrl, setAvatarUrl] = useState<string>(config.avatarUrl || '')
  
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

  // Load presets from localStorage (temporary solution)
  useEffect(() => {
    if (config.id) {
      const savedProfilePreset = localStorage.getItem(`profile-preset-${config.id}`)
      if (savedProfilePreset && getProfilePresetById(savedProfilePreset)) {
        setProfilePresetId(savedProfilePreset)
      }
      
      const savedTitleFontPreset = localStorage.getItem(`title-font-preset-${config.id}`)
      if (savedTitleFontPreset && getTitleFontPresetById(savedTitleFontPreset)) {
        setTitleFontPresetId(savedTitleFontPreset)
      }

      const savedTitleColor = localStorage.getItem(`title-color-${config.id}`)
      if (savedTitleColor) {
        setTitleColor(savedTitleColor)
      }

      const savedAvatarUrl = localStorage.getItem(`avatar-url-${config.id}`)
      if (savedAvatarUrl) {
        setAvatarUrl(savedAvatarUrl)
      } else if (config.avatarUrl) {
        // Fallback to config avatarUrl if localStorage doesn't have it
        setAvatarUrl(config.avatarUrl)
      }
    }
  }, [config.id])


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
        
        @media (max-width: 768px) {
          .title-styled {
            font-size: calc(${titleStylePreset.styles.titleFontSize} * 0.85) !important;
            line-height: 1.2 !important;
          }
          .description-styled {
            font-size: calc(${titleStylePreset.styles.descriptionFontSize} * 0.9) !important;
            line-height: 1.5 !important;
          }
          .content-container {
            /* padding removed - now handled by profile card styles */
          }
          .action-button {
            font-size: 16px !important;
            padding: 18px 24px !important;
            margin: 0 !important;
          }
          .title-gradient {
            font-size: 2.5rem !important;
          }
          .profile-avatar {
            width: 100px !important;
            height: 100px !important;
            margin-bottom: 16px !important;
          }
          .profile-avatar img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: inherit !important;
          }
          .profile-card-container {
            padding: 24px !important;
            margin: 16px !important;
            min-height: 280px !important;
          }
        }
        
        @media (max-width: 480px) {
          .title-styled {
            font-size: calc(${titleStylePreset.styles.titleFontSize} * 0.75) !important;
          }
          .description-styled {
            font-size: calc(${titleStylePreset.styles.descriptionFontSize} * 0.85) !important;
          }
          .title-gradient {
            font-size: 2rem !important;
          }
          .action-button {
            font-size: 15px !important;
            padding: 16px 20px !important;
            margin: 0 !important;
          }
          .profile-avatar {
            width: 90px !important;
            height: 90px !important;
            margin-bottom: 14px !important;
          }
          .profile-card-container {
            padding: 20px !important;
            margin: 12px !important;
            min-height: 260px !important;
          }
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
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Enhanced background elements */}
        {!activeBackground.preset && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Animated gradient orbs */}
            <motion.div 
              className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${config.brandColor}08 0%, transparent 50%)`,
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
                background: `radial-gradient(circle, ${config.brandColor}12 0%, transparent 60%)`,
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
                  radial-gradient(at 20% 80%, ${config.brandColor}06 0%, transparent 50%),
                  radial-gradient(at 80% 20%, ${config.accentColor || '#ffffff'}05 0%, transparent 50%),
                  radial-gradient(at 40% 40%, ${config.brandColor}04 0%, transparent 50%)
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
        const profilePreset = getProfilePresetById(profilePresetId) || getProfilePresetById(defaultProfilePresetId)!
        const styles = profilePreset.styles
        
        return (
          <motion.div 
            className="relative z-10 w-full max-w-md mx-auto mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Profile Card Container */}
              <div 
                className="relative overflow-hidden text-center profile-card-container"
                style={{
                  padding: styles.containerPadding,
                  borderRadius: styles.containerBorderRadius,
                  background: styles.containerBackground,
                  border: styles.containerBorder,
                  boxShadow: styles.containerShadow
                }}
              >
                 {/* Profile Avatar */}
                 <motion.div 
                   className="relative mx-auto overflow-hidden profile-avatar"
                   style={{
                     width: styles.avatarSize,
                     height: styles.avatarSize,
                     borderRadius: styles.avatarBorderRadius,
                     border: styles.avatarBorder,
                     boxShadow: styles.avatarShadow,
                     background: styles.avatarBackground,
                     marginBottom: '16px'
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
                       style={{ 
                         fontSize: styles.titleFontSize,
                         fontWeight: titleFontPreset.fontWeight,
                         color: titleColor,
                         margin: styles.titleMargin,
                         letterSpacing: titleFontPreset.letterSpacing,
                         fontFamily: titleFontPreset.fontFamily
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
                    style={{ 
                      fontSize: styles.descriptionFontSize,
                      color: styles.descriptionColor,
                      margin: styles.descriptionMargin,
                      lineHeight: styles.descriptionLineHeight,
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}
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
        className="relative z-10 w-full max-w-3xl mx-auto content-container"
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

        {/* Premium Display Text with visual hierarchy */}
        {displayText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-transparent to-pink-50 rounded-xl blur-2xl opacity-40" />
            
             <p className="relative text-lg md:text-xl lg:text-2xl text-gray-800 text-center font-semibold leading-relaxed tracking-tight" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
               <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                 {displayText}
               </span>
             </p>
            
            {/* Subtle quote marks for emphasis */}
            <div className="absolute -left-4 -top-2 text-4xl text-purple-200 font-serif opacity-50">"</div>
            <div className="absolute -right-4 -bottom-2 text-4xl text-purple-200 font-serif opacity-50 rotate-180">"</div>
          </motion.div>
        )}

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
            className="w-full max-w-md mx-auto mt-4 space-y-6 px-2 sm:px-0"
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
                     action-button relative block w-full text-center font-semibold
                     transition-all duration-300 ease-out overflow-visible
                     py-5 px-8 rounded-xl
                     hover:shadow-xl hover:shadow-purple-200/30
                     transform-gpu
                     group
                   `}
                   style={{
                     backgroundColor: styles.gradient ? 'transparent' : styles.backgroundColor,
                     backgroundImage: styles.gradient ? styles.backgroundColor : 'none',
                     color: styles.color,
                     borderColor: 'transparent', // Kenarlık yok
                     borderWidth: '0px',
                     borderStyle: 'none',
                     borderRadius: '12px', // Sabit radius
                     fontSize: '16px',
                     letterSpacing: '-0.01em',
                     position: 'relative',
                     isolation: 'isolate',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Sabit gölge
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
                  {/* Sabit dış çizikli kenarlık - tüm butonlarda görünür */}
                  <span 
                    className="absolute rounded-2xl pointer-events-none dashed-border-static hidden sm:block"
                    style={{
                      inset: '-6px',
                      border: '2px dashed #E5E7EB',
                      opacity: 0.5,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Mobile-safe dashed border */}
                  <span 
                    className="absolute rounded-2xl pointer-events-none dashed-border-static block sm:hidden"
                    style={{
                      inset: '-3px',
                      border: '1px dashed #E5E7EB',
                      opacity: 0.5,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* Animated dashed border on hover - desktop only */}
                  <span 
                    className="absolute rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 hidden sm:block"
                    style={{
                      inset: '-6px',
                      border: '2px dashed #E5E7EB',
                      animation: 'rotate-dash 8s linear infinite',
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  
                  {/* Button content with icon */}
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {/* Trophy/Icon placeholder */}
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg 
                        className="w-4 h-4" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="font-medium">{action.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </span>
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </motion.div>
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
