'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { PageConfig } from '@/lib/types/page'
import { motion, AnimatePresence } from 'framer-motion'
import { getPresetById, defaultPresetId } from '@/lib/button-presets'
import { useAnalytics } from '@/hooks/useAnalytics'
import { BackgroundPicker } from '@/components/background-picker'
import { backgroundPresets, applyPresetControls, type BackgroundPreset } from '@/lib/background-presets'
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
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)

  // Normalize avatar URL and enforce HTTPS to avoid mixed-content issues on some devices
  const sanitizedAvatarUrl = useMemo(() => {
    if (!avatarUrl) return ''
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'https://'
      const urlObj = new URL(avatarUrl, base)
      if (urlObj.protocol === 'http:') {
        urlObj.protocol = 'https:'
      }
      return urlObj.toString()
    } catch {
      return avatarUrl
    }
  }, [avatarUrl])
  
  // Listen for avatar changes from edit page (if same site)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `avatar-url-${config.id}` && e.newValue) {
        setAvatarUrl(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [config.id])
  const { trackPageView, trackActionClick } = useAnalytics()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    // Track page view when component mounts
    if (config.slug) {
      trackPageView(config.slug, window.location.pathname)
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

    // Check motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [config.slug, config.backgroundPreference, trackPageView])

  // Reset avatar error state when URL changes
  useEffect(() => {
    if (avatarLoadFailed) setAvatarLoadFailed(false)
  }, [avatarUrl])

  // Load avatar URL: database takes priority
  useEffect(() => {
    if (config.id) {
      if (config.avatarUrl) {
        setAvatarUrl(config.avatarUrl)
        localStorage.setItem(`avatar-url-${config.id}`, config.avatarUrl)
      } else {
        const savedAvatarUrl = localStorage.getItem(`avatar-url-${config.id}`)
        setAvatarUrl(savedAvatarUrl || '')
      }
    }
  }, [config.id, config.avatarUrl])


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

  // Handle action click
  const handleActionClick = (action: any, index: number) => {
    // Direct navigation
    window.open(action.href, '_blank', 'noopener,noreferrer')
    
    // Track action click
    if (config.slug) {
      trackActionClick(config.slug, index, action.label)
    }
  }


  // Determine which background to use
  const activeBackground = previewBackground || currentBackground
  let backgroundStyle: React.CSSProperties = {}
  let animationClass = ''
  let animationCSS = ''
  
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
         @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');

         * {
           -webkit-font-smoothing: antialiased;
           -moz-osx-font-smoothing: grayscale;
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
        
        /* Typography */
        .responsive-title {
          font-size: 22px !important;
          color: #ffffff !important;
          font-family: 'Cinzel', serif !important;
          font-weight: 700 !important;
          letter-spacing: 0.04em !important;
          line-height: 1.2 !important;
          text-align: center !important;
          margin: 0 !important;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55) !important;
        }

        .responsive-description {
          font-size: 12px !important;
          color: rgba(255, 255, 255, 0.5) !important;
          font-family: inherit !important;
          font-weight: 400 !important;
          letter-spacing: 0.01em !important;
          line-height: 1.4 !important;
          text-align: center !important;
          margin: 4px 0 0 0 !important;
          max-width: 100% !important;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }

        @media (max-width: 768px) {
          .responsive-title {
            font-size: 20px !important;
          }

          .responsive-description {
            font-size: 11.5px !important;
          }

          .banner-button-mobile {
            min-height: 72px !important;
            max-height: 96px !important;
          }

          .banner-image-mobile {
            object-fit: contain !important;
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
      <main 
        className={`min-h-dvh relative overflow-hidden ${animationClass}`} 
        style={{
          ...backgroundStyle,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '32px'
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

      {/* Profile Card - Compact Horizontal */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-4"
        style={{ margin: '0 auto 20px auto' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      >
        <div
          className="relative flex items-center gap-4"
          style={{
            padding: '13px 16px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          {/* Avatar - Left */}
          <motion.div
            className="relative flex-shrink-0"
            style={{ width: '56px', height: '56px', borderRadius: '50%' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Double ring: sharp 2px white + 4px diffuse glow */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.78), 0 0 0 5px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {sanitizedAvatarUrl && !avatarLoadFailed ? (
                <img
                  src={sanitizedAvatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setAvatarLoadFailed(true)}
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.07) 100%)' }}
                >
                  <svg className="w-6 h-6 text-white" style={{ opacity: 0.7 }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
          </motion.div>

          {/* Text - Centered in remaining space */}
          <div className="flex-1 min-w-0 flex flex-col items-center text-center">
            <motion.h1
              className="responsive-title"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {config.title}
            </motion.h1>

            {config.meta?.description && (
              <motion.p
                className="responsive-description"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {config.meta.description}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

        {/* Action Buttons Container */}
        {sortedActions.length > 0 && (
          <motion.div
            className="w-full max-w-md mx-auto px-4 mb-6"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {sortedActions.map((action, index) => {
              // Get preset or use default
              const preset = getPresetById(action.preset || defaultPresetId) || getPresetById(defaultPresetId)!
              const styles = preset.styles
              const isBannerPreset = !!preset.bannerImage
              
              // Handle gradients and regular colors
              const backgroundStyle = styles.backgroundColor.includes('gradient') 
                ? { backgroundImage: styles.backgroundColor }
                : { backgroundColor: styles.backgroundColor }
              
              const hoverBackgroundStyle = styles.hoverBackgroundColor?.includes('gradient')
                ? { backgroundImage: styles.hoverBackgroundColor }
                : { backgroundColor: styles.hoverBackgroundColor }
              
              return (
                <motion.button
                  key={action.id || index}
                  onClick={() => handleActionClick(action, index)}
                  type="button"
                   className={`
                     relative block w-full text-center font-semibold
                     transition-all duration-300 ease-out overflow-hidden
                     ${isBannerPreset ? 'py-0' : 'py-4 px-6'} rounded-xl
                     hover:shadow-xl hover:shadow-purple-200/30
                     transform-gpu
                     group
                     ${isBannerPreset ? 'min-h-[100px] banner-button-mobile' : 'min-h-[60px]'}
                   `}
                   style={{
                     backgroundColor: isBannerPreset ? 'transparent' : (styles.gradient ? 'transparent' : styles.backgroundColor),
                     backgroundImage: isBannerPreset ? 'none' : (styles.gradient ? styles.backgroundColor : 'none'),
                     color: styles.color,
                     borderColor: 'transparent',
                     borderWidth: '0px',
                     borderStyle: 'none',
                     borderRadius: '12px',
                     fontSize: '16px',
                     letterSpacing: '-0.01em',
                     position: 'relative',
                     isolation: 'isolate',
                     boxShadow: isBannerPreset ? '0 4px 12px -1px rgba(0, 0, 0, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                   }}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.06,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ 
                    scale: isBannerPreset ? 1.01 : 1.02,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    if (!isBannerPreset) {
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
                    }
                    // Kenarlık yok
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.transform = `translateY(-2px) scale(${isBannerPreset ? '1.01' : '1.02'})`
                    e.currentTarget.style.boxShadow = isBannerPreset 
                      ? '0 8px 20px -5px rgba(0, 0, 0, 0.2)' 
                      : (styles.shadow ? `${styles.shadow}, 0 10px 25px -5px rgba(0, 0, 0, 0.15)` : `0 10px 25px -5px ${styles.color}40, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`)
                  }}
                  onMouseLeave={(e) => {
                    if (!isBannerPreset) {
                      if (preset.styles.gradient) {
                        e.currentTarget.style.backgroundImage = styles.backgroundColor
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else {
                        e.currentTarget.style.backgroundColor = styles.backgroundColor
                        e.currentTarget.style.backgroundImage = 'none'
                      }
                      e.currentTarget.style.color = styles.color
                    }
                    // Kenarlık yok
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = isBannerPreset 
                      ? '0 4px 12px -1px rgba(0, 0, 0, 0.15)' 
                      : (styles.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)')
                  }}
                >
                  {/* Banner image mode */}
                  {isBannerPreset ? (
                    <div className="relative z-10 w-full h-full">
                      <img
                        src={preset.bannerImage}
                        alt={action.label}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 banner-image-mobile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    /* Button content with centered logo at top */
                    <div className="relative z-10 flex flex-col items-center justify-center w-full gap-2">
                      {/* Logo at the top - centered */}
                      {config.logoUrl && (
                        <div className="flex items-center justify-center max-w-[160px] max-h-[72px] p-3">
                          <img
                            src={config.logoUrl}
                            alt="Logo"
                            className="max-w-full max-h-full w-auto h-auto object-contain"
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
                        <div className="min-w-[80px] min-h-[40px] max-w-[120px] max-h-[60px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg group-hover:from-gray-800 group-hover:to-gray-900 group-hover:scale-105 transition-all duration-300 p-2">
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
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}

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
        transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <p className="text-xs text-white opacity-70">
            Linkfy. bir KirveHUB projesidir.
          </p>
        </div>
      </motion.footer>
      </main>

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
