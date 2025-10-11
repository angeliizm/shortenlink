'use client'

import { useState } from 'react'
import { ButtonPreset, buttonPresets, getPresetById } from '@/lib/button-presets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Palette, Check } from 'lucide-react'

interface ButtonPresetSelectorProps {
  currentPresetId: string
  onSave: (presetId: string) => void
  onClose: () => void
}

export default function ButtonPresetSelector({ 
  currentPresetId, 
  onSave, 
  onClose 
}: ButtonPresetSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentPresetId)

  const handleSave = () => {
    onSave(selectedPresetId)
    onClose()
  }

  const renderButtonPreview = (preset: ButtonPreset) => {
    const styles = preset.styles
    
    // Handle gradients and regular colors
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
          boxShadow: styles.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Örnek Buton
        </span>
        
        {/* Hover effect overlay */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            backgroundColor: styles.hoverBackgroundColor?.includes('gradient') 
              ? 'transparent' 
              : styles.hoverBackgroundColor || styles.backgroundColor,
            backgroundImage: styles.hoverBackgroundColor?.includes('gradient') 
              ? styles.hoverBackgroundColor 
              : 'none',
            color: styles.hoverTextColor || styles.color
          }}
        >
          <div 
            className="w-full h-full flex items-center justify-center text-sm font-semibold"
            style={{
              color: styles.hoverTextColor || styles.color
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Örnek Buton
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-lg"></div>
        <div className="relative z-10">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              Buton Stili Seç
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Eylem butonlarınız için bir stil seçin. Seçtiğiniz stil tüm butonlara uygulanacaktır.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] pr-2">
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
                    
                    {/* Style details */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm"
                          style={{ 
                            backgroundColor: preset.styles.backgroundColor.includes('gradient') 
                              ? '#6366F1' 
                              : preset.styles.backgroundColor 
                          }}
                        />
                        <span className="text-sm text-gray-600 font-medium">Ana Renk</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.styles.gradient && (
                          <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                            ✨ Gradient
                          </span>
                        )}
                        {preset.styles.shadow && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            💫 Gölge
                          </span>
                        )}
                        {preset.styles.borderWidth && preset.styles.borderWidth !== '0px' && (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            🔲 Kenarlık
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200">
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
      </DialogContent>
    </Dialog>
  )
}
