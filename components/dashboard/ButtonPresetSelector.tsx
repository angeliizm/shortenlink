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
        className="w-full h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer relative overflow-hidden"
        style={{
          ...backgroundStyle,
          color: styles.color,
          borderColor: styles.borderColor || 'transparent',
          borderWidth: styles.borderWidth || '0px',
          borderStyle: styles.borderStyle || 'solid',
          borderRadius: styles.borderRadius || '8px',
          boxShadow: styles.shadow || 'none',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}
      >
        <span className="relative z-10">Örnek Buton</span>
        
        {/* Hover effect overlay */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
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
            className="w-full h-full flex items-center justify-center text-sm font-medium"
            style={{
              color: styles.hoverTextColor || styles.color
            }}
          >
            Örnek Buton
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Buton Stili Seç
          </DialogTitle>
          <DialogDescription>
            Eylem butonlarınız için bir stil seçin. Seçtiğiniz stil tüm butonlara uygulanacaktır.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buttonPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id
              
              return (
                <Card 
                  key={preset.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-purple-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPresetId(preset.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {preset.name}
                      </CardTitle>
                      {isSelected && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {renderButtonPreview(preset)}
                    
                    {/* Style details */}
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: preset.styles.backgroundColor.includes('gradient') 
                              ? '#6366F1' 
                              : preset.styles.backgroundColor 
                          }}
                        />
                        <span>Ana Renk</span>
                      </div>
                      {preset.styles.gradient && (
                        <div className="text-purple-600 font-medium">
                          ✨ Gradient Stil
                        </div>
                      )}
                      {preset.styles.shadow && (
                        <div className="text-blue-600 font-medium">
                          💫 Gölge Efekti
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Palette className="w-4 h-4 mr-2" />
            Stili Uygula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
