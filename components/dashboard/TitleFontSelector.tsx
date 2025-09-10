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
  currentColor?: string
  onSave: (presetId: string, color: string) => void
  onClose: () => void
}

export function TitleFontSelector({
  siteId,
  currentPresetId,
  currentTitle,
  currentColor,
  onSave,
  onClose
}: TitleFontSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId || 'modern-sans')
  const [selectedColor, setSelectedColor] = useState(currentColor || '#1f2937')

  const handleSave = () => {
    onSave(selectedPresetId, selectedColor)
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
            {/* Color Picker Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Title Color</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{selectedColor}</span>
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded border border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span
                      style={{
                        fontFamily: getTitleFontPresetById(selectedPresetId)?.fontFamily || 'Helvetica',
                        fontSize: '12px',
                        fontWeight: getTitleFontPresetById(selectedPresetId)?.fontWeight || '600',
                        color: selectedColor === '#ffffff' || selectedColor === '#fff' ? '#000000' : '#ffffff',
                        letterSpacing: getTitleFontPresetById(selectedPresetId)?.letterSpacing || '-0.02em'
                      }}
                    >
                      {currentTitle || 'Sample Title'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Suggested Colors from Profile Presets */}
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-600 mb-2">Suggested Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Import profile presets to get suggested colors
                    const { profilePresets } = require('@/lib/profile-presets')
                    const suggestedColors = [
                      '#1f2937', // Default dark
                      '#ffffff', // White
                      '#000000', // Black
                      '#00ff41', // Cyberpunk green
                      '#8b5cf6', // Purple
                      '#ff1493', // Pink
                      '#3b82f6', // Blue
                      '#ffd700', // Gold
                      '#10b981', // Green
                      '#f97316', // Orange
                      '#dc2626', // Red
                      '#06b6d4', // Cyan
                    ]
                    
                    return suggestedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                          selectedColor === color 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  })()}
                </div>
              </div>
            </div>

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
                          color: selectedColor,
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
