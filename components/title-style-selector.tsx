'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Smartphone, Monitor, RotateCcw, Check } from 'lucide-react'
import { titleStylePresets, getTitleStyles, getDescriptionStyles, getAccentElement, type TitleStylePreset } from '@/lib/title-style-presets.tsx'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface TitleStyleSelectorProps {
  siteId: string
  currentTitle: string
  currentDescription?: string
  currentPresetId?: string
  onSave: (presetId: string) => Promise<void>
  onPreviewChange?: (preset: TitleStylePreset) => void
  // New: allow passing current background style to render under preview
  backgroundStyle?: React.CSSProperties
}

export function TitleStyleSelector({
  siteId,
  currentTitle,
  currentDescription,
  currentPresetId,
  onSave,
  onPreviewChange,
  backgroundStyle,
}: TitleStyleSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<TitleStylePreset | null>(
    currentPresetId ? titleStylePresets.find(p => p.id === currentPresetId) || titleStylePresets[0] : titleStylePresets[0]
  )
  const [isSaving, setIsSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const { toast } = useToast()

  // Load Google Fonts for previews
  useEffect(() => {
    const loadedFonts = new Set<string>()
    
    titleStylePresets.forEach(preset => {
      if (preset.preview?.googleFonts) {
        preset.preview.googleFonts.forEach(font => {
          if (!loadedFonts.has(font)) {
            const link = document.createElement('link')
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`
            link.rel = 'stylesheet'
            document.head.appendChild(link)
            loadedFonts.add(font)
          }
        })
      }
    })
  }, [])

  const handlePresetSelect = (preset: TitleStylePreset) => {
    setSelectedPreset(preset)
    onPreviewChange?.(preset)
  }

  const handleSave = async () => {
    if (!selectedPreset) return
    setIsSaving(true)
    try {
      await onSave(selectedPreset.id)
      toast({
        title: "Title style updated",
        description: `Applied "${selectedPreset.name}" style to your site`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save title style",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      await onSave('')
      setSelectedPreset(titleStylePresets[0])
      toast({
        title: "Reset to default",
        description: "Title style has been reset",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset title style",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-600" />
          Title & SEO Style
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose a professional typography style for your site
        </p>
      </div>

      {/* Live Preview */}
      <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ background: 'transparent' }}>
        {/* Preview Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm font-medium text-gray-700">Live Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('desktop')}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === 'desktop' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === 'mobile' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="relative">
          {/* Background layer */}
          <div className="absolute inset-0 -z-10" style={{
            ...(backgroundStyle || {}),
            transition: 'background 300ms ease, background-color 300ms ease'
          }} />
          {/* Foreground content */}
          <div 
            className={cn(
              "p-8 min-h-[200px] transition-all duration-300",
              viewMode === 'mobile' && "max-w-sm mx-auto"
            )}
            style={{
              background: selectedPreset?.styles.backgroundTreatment === 'subtle-gradient' 
                ? 'linear-gradient(135deg, rgba(245,247,250,0.7) 0%, rgba(195,207,226,0.7) 100%)'
                : selectedPreset?.styles.backgroundTreatment === 'blur-card'
                ? 'rgba(255, 255, 255, 0.7)'
                : 'transparent',
              backdropFilter: selectedPreset?.styles.backgroundTreatment === 'blur-card' ? 'blur(10px)' : 'none',
              boxShadow: selectedPreset?.styles.backgroundTreatment === 'shadow-box' 
                ? '0 10px 40px -10px rgba(0, 0, 0, 0.1)' 
                : 'none',
            }}
          >
          {selectedPreset && (
            <div 
              style={{
                textAlign: selectedPreset.styles.textAlign,
                padding: viewMode === 'mobile' 
                  ? selectedPreset.styles.containerPaddingMobile 
                  : selectedPreset.styles.containerPadding,
                position: 'relative',
              }}
            >
              {/* Accent Element (if bracket) */}
              {selectedPreset.styles.accentElement === 'bracket' && (
                <div className="relative">
                  {getAccentElement(selectedPreset)}
                </div>
              )}
              
              {/* Title */}
              <h1 
                style={{
                  ...getTitleStyles(selectedPreset),
                  fontSize: viewMode === 'mobile' 
                    ? selectedPreset.styles.titleFontSizeMobile 
                    : selectedPreset.styles.titleFontSize,
                }}
              >
                {currentTitle || 'Your Site Title'}
              </h1>
              
              {/* Accent Element (if underline or dot) */}
              {(selectedPreset.styles.accentElement === 'underline' || 
                selectedPreset.styles.accentElement === 'dot') && 
                getAccentElement(selectedPreset)}
              
              {/* Description */}
              {currentDescription && (
                <p 
                  style={{
                    ...getDescriptionStyles(selectedPreset),
                    fontSize: viewMode === 'mobile' 
                      ? selectedPreset.styles.descriptionFontSizeMobile 
                      : selectedPreset.styles.descriptionFontSize,
                  }}
                >
                  {currentDescription}
                </p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Style Presets</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {titleStylePresets.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all text-left',
                selectedPreset?.id === preset.id
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              {/* Preview Text */}
              <div className="space-y-2 mb-3">
                <div 
                  className="text-xs font-semibold truncate"
                  style={{
                    fontFamily: preset.styles.titleFontFamily,
                    color: preset.styles.titleColor === 'transparent' ? '#667eea' : preset.styles.titleColor,
                  }}
                >
                  Aa
                </div>
                <div className="h-1 w-8 bg-gray-200 rounded" />
                <div className="h-1 w-12 bg-gray-100 rounded" />
              </div>
              
              {/* Preset Name */}
              <div>
                <p className="text-xs font-medium text-gray-900">{preset.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                  {preset.description}
                </p>
              </div>
              
              {/* Selection Indicator */}
              {selectedPreset?.id === preset.id && (
                <div className="absolute top-2 right-2 p-1 bg-purple-600 rounded-full">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Current Indicator */}
              {currentPresetId === preset.id && (
                <div className="absolute top-2 left-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to default
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !selectedPreset}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
            selectedPreset && !isSaving
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          {isSaving ? 'Saving...' : 'Apply Style'}
        </button>
      </div>
    </div>
  )
}