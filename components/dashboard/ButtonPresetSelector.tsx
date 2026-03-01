'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ButtonPreset, buttonPresets } from '@/lib/button-presets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Check, X } from 'lucide-react'

interface ButtonPresetSelectorProps {
  currentPresetId: string
  onSave: (presetId: string) => void
  onClose: () => void
  open?: boolean
}

export default function ButtonPresetSelector({
  currentPresetId,
  onSave,
  onClose,
  open = true,
}: ButtonPresetSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentPresetId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Sync selection when dialog reopens
  useEffect(() => {
    if (open) setSelectedPresetId(currentPresetId)
  }, [open, currentPresetId])

  const handleSave = () => {
    onSave(selectedPresetId)
    onClose()
  }

  const renderButtonPreview = (preset: ButtonPreset) => {
    const styles = preset.styles
    const backgroundStyle = styles.backgroundColor.includes('gradient')
      ? { backgroundImage: styles.backgroundColor }
      : { backgroundColor: styles.backgroundColor }

    return (
      <div
        className="w-full h-14 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden shadow-lg"
        style={{
          ...backgroundStyle,
          color: styles.color,
          borderColor: styles.borderColor || 'transparent',
          borderWidth: styles.borderWidth || '0px',
          borderStyle: styles.borderStyle || 'solid',
          borderRadius: styles.borderRadius || '12px',
          boxShadow: styles.shadow || '0 4px 6px -1px rgba(0,0,0,0.1)',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}
      >
        {preset.bannerImage ? (
          <img src={preset.bannerImage} alt={preset.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <>
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Örnek Buton
            </span>
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{
                backgroundColor: styles.hoverBackgroundColor?.includes('gradient')
                  ? 'transparent'
                  : styles.hoverBackgroundColor || styles.backgroundColor,
                backgroundImage: styles.hoverBackgroundColor?.includes('gradient')
                  ? styles.hoverBackgroundColor
                  : 'none',
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center text-sm font-semibold"
                style={{ color: styles.hoverTextColor || styles.color }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Örnek Buton
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-lg bg-white shadow-2xl flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Buton Stili Seç</h2>
              </div>
              <p className="text-gray-600 text-base ml-13 pl-1">
                Eylem butonlarınız için bir stil seçin.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="overflow-y-auto flex-1 px-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buttonPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id
                return (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 ${
                      isSelected
                        ? 'ring-2 ring-purple-500 shadow-xl scale-105'
                        : 'hover:shadow-lg hover:ring-1 hover:ring-purple-200'
                    }`}
                    onClick={() => setSelectedPresetId(preset.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800">
                          {preset.name}
                        </CardTitle>
                        {isSelected && (
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {renderButtonPreview(preset)}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
                            style={{
                              backgroundColor: preset.styles.backgroundColor.includes('gradient')
                                ? '#6366F1'
                                : preset.styles.backgroundColor,
                            }}
                          />
                          <span className="text-sm text-gray-600 font-medium">Ana Renk</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {preset.bannerImage && (
                            <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">🖼️ Banner</span>
                          )}
                          {preset.styles.gradient && (
                            <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">✨ Gradient</span>
                          )}
                          {preset.styles.shadow && (
                            <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">💫 Gölge</span>
                          )}
                          {preset.styles.borderWidth && preset.styles.borderWidth !== '0px' && (
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">🔲 Kenarlık</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-2 border-gray-300 hover:bg-gray-50 h-10"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-10"
            >
              <Palette className="w-4 h-4 mr-2" />
              Stili Uygula
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
