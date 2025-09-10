'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { titleFontPresets, getTitleFontPresetById } from '@/lib/title-font-presets'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TitleFontSelectorProps {
  siteId: string
  currentPresetId?: string
  currentTitle: string
  onSave: (presetId: string) => void
  onClose: () => void
}

export function TitleFontSelector({
  siteId,
  currentPresetId,
  currentTitle,
  onSave,
  onClose
}: TitleFontSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId || 'modern-sans')

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
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Choose Title Font Style</h2>
              <p className="text-sm text-gray-500 mt-1">
                Select the font style for your site title
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

            {/* Font Presets */}
            <h3 className="text-sm font-medium text-gray-700 mb-3">Font Styles</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {titleFontPresets.map((preset) => (
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
                    <div
                      className="w-full h-16 rounded-lg mb-3 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span
                        style={{
                          fontFamily: preset.fontFamily,
                          fontSize: '12px',
                          fontWeight: preset.fontWeight,
                          color: '#1f2937',
                          letterSpacing: preset.letterSpacing,
                          textAlign: 'center'
                        }}
                      >
                        {currentTitle || 'Sample Title'}
                      </span>
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
              Selected: {getTitleFontPresetById(selectedPresetId)?.name || 'None'}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Apply Font Style
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
