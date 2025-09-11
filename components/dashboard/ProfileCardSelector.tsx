'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profilePresets, getProfilePresetById } from '@/lib/profile-presets'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ProfileCardSelectorProps {
  siteId: string
  currentPresetId?: string
  onSave: (presetId: string) => void
  onClose: () => void
}

export function ProfileCardSelector({
  siteId,
  currentPresetId,
  onSave,
  onClose
}: ProfileCardSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId || 'minimal-clean')

  const handleSave = () => {
    onSave(selectedPresetId)
    onClose()
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
          className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Profil Kartı Stili Seçin</h2>
              <p className="text-sm text-gray-500 mt-1">
                Profil kartınız için tasarım stilini seçin
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {profilePresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    selectedPresetId === preset.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPresetId(preset.id)}
                >
                  <div className="p-3">
                    <div
                      className="w-full h-20 rounded-lg mb-2 relative overflow-hidden"
                      style={{
                        background: preset.styles.containerBackground,
                        borderRadius: preset.styles.containerBorderRadius,
                        border: preset.styles.containerBorder,
                        boxShadow: preset.styles.containerShadow
                      }}
                    >
                      {/* Mini avatar preview */}
                      <div
                        className="absolute top-1 left-1/2 transform -translate-x-1/2"
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: preset.styles.avatarBorderRadius,
                          background: preset.styles.avatarBackground,
                          border: preset.styles.avatarBorder
                        }}
                      />
                      {/* Mini title preview */}
                      <div
                        className="absolute bottom-1 left-1 right-1 h-1.5 rounded"
                        style={{
                          background: '#1f2937',
                          opacity: 0.7
                        }}
                      />
                      {/* Decorative elements preview */}
                      {preset.styles.showDecorativeElements && (
                        <>
                          <div
                            className="absolute top-0.5 right-0.5 rounded-full"
                            style={{
                              width: '3px',
                              height: '3px',
                              backgroundColor: preset.styles.decorativeColor,
                              opacity: 0.6
                            }}
                          />
                          <div
                            className="absolute bottom-0.5 left-0.5 rounded-full"
                            style={{
                              width: '1.5px',
                              height: '1.5px',
                              backgroundColor: preset.styles.decorativeColor,
                              opacity: 0.4
                            }}
                          />
                        </>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center text-gray-700">
                      {preset.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Seçilen: {getProfilePresetById(selectedPresetId)?.name || 'Hiçbiri'}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleSave}>
                Kart Stilini Uygula
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
