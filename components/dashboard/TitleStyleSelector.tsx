'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { titleStylePresets, getTitleStyles, getDescriptionStyles, getAccentElement, type TitleStylePreset } from '@/lib/title-style-presets'
import { Button } from '@/components/ui/button'
import { X, Eye } from 'lucide-react'

interface TitleStyleSelectorProps {
  siteId: string
  currentPresetId?: string
  currentTitle: string
  currentDescription?: string
  onSave: (presetId: string) => void
  onClose: () => void
}

export function TitleStyleSelector({
  siteId,
  currentPresetId,
  currentTitle,
  currentDescription,
  onSave,
  onClose
}: TitleStyleSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId || 'clean-minimal')
  const [previewPreset, setPreviewPreset] = useState<TitleStylePreset | null>(null)

  // Load Google Fonts for preview
  useEffect(() => {
    const preset = titleStylePresets.find(p => p.id === selectedPresetId)
    if (preset?.preview?.googleFonts) {
      preset.preview.googleFonts.forEach(font => {
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      })
    }
    setPreviewPreset(preset || null)
  }, [selectedPresetId])

  const handleSave = () => {
    onSave(selectedPresetId)
    onClose()
  }

  const renderPreview = (preset: TitleStylePreset) => {
    const titleStyles = getTitleStyles(preset)
    const descriptionStyles = getDescriptionStyles(preset)
    const accentElement = getAccentElement(preset)

    return (
      <div 
        className="w-full h-32 rounded-lg border border-gray-200 overflow-hidden relative"
        style={{
          background: preset.styles.backgroundTreatment === 'subtle-gradient' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : preset.styles.backgroundTreatment === 'blur-card'
            ? 'rgba(255, 255, 255, 0.1)'
            : '#ffffff',
          backdropFilter: preset.styles.backgroundTreatment === 'blur-card' ? 'blur(10px)' : 'none',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: preset.styles.textAlign === 'center' ? 'center' : 'flex-start',
          position: 'relative'
        }}
      >
        {/* Background treatment */}
        {preset.styles.backgroundTreatment === 'shadow-box' && (
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          />
        )}

        {/* Title */}
        <h3 
          className="relative z-10"
          style={{
            ...titleStyles,
            fontSize: '1.5rem',
            margin: '0 0 0.5rem 0',
            textAlign: preset.styles.textAlign,
            background: preset.styles.accentColor?.includes('gradient') ? preset.styles.accentColor : undefined,
            WebkitBackgroundClip: preset.styles.accentColor?.includes('gradient') ? 'text' : undefined,
            WebkitTextFillColor: preset.styles.accentColor?.includes('gradient') ? 'transparent' : undefined,
            backgroundClip: preset.styles.accentColor?.includes('gradient') ? 'text' : undefined,
          }}
        >
          {currentTitle || 'Sample Title'}
        </h3>

        {/* Description */}
        {currentDescription && (
          <p 
            className="relative z-10"
            style={{
              ...descriptionStyles,
              fontSize: '0.75rem',
              margin: '0',
              textAlign: preset.styles.textAlign,
              maxWidth: '100%'
            }}
          >
            {currentDescription}
          </p>
        )}

        {/* Accent Element */}
        {accentElement && (
          <div className="relative z-10">
            {accentElement}
          </div>
        )}

        {/* Highlight effect for highlight accent */}
        {preset.styles.accentElement === 'highlight' && preset.styles.accentColor && !preset.styles.accentColor.includes('gradient') && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${preset.styles.accentColor} 50%, transparent 100%)`,
              mixBlendMode: 'multiply'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Başlık Stili Seç</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sitenizin başlık ve açıklama stilini seçin
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Style Presets */}
            <h3 className="text-sm font-medium text-gray-700 mb-4">Stil Şablonları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titleStylePresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    selectedPresetId === preset.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPresetId(preset.id)}
                >
                  <div className="p-4">
                    {/* Preview */}
                    {renderPreview(preset)}
                    
                    {/* Preset Info */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-center text-gray-700">
                        {preset.name}
                      </p>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Seçilen: {titleStylePresets.find(p => p.id === selectedPresetId)?.name || 'Yok'}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleSave}>
                Stili Uygula
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
