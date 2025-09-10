'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, X, Check, RotateCcw, Sparkles } from 'lucide-react'
import { backgroundPresets, applyPresetControls, type BackgroundPreset } from '@/lib/background-presets'
import { cn } from '@/lib/utils'

interface BackgroundPickerProps {
  siteId: string
  currentPresetId?: string
  currentControls?: Record<string, string | number>
  onSave: (presetId: string, controls: Record<string, string | number>) => Promise<void>
  onPreview: (preset: BackgroundPreset, controls: Record<string, string | number>) => void
  onClose: () => void
}

export function BackgroundPicker({
  siteId,
  currentPresetId,
  currentControls = {},
  onSave,
  onPreview,
  onClose,
}: BackgroundPickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset | null>(
    currentPresetId ? backgroundPresets.find(p => p.id === currentPresetId) || null : null
  )
  const [controlValues, setControlValues] = useState<Record<string, string | number>>(currentControls)
  const [isSaving, setIsSaving] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handlePresetSelect = (preset: BackgroundPreset) => {
    setSelectedPreset(preset)
    const defaultControls: Record<string, string | number> = {}
    preset.controls?.forEach(control => {
      defaultControls[control.id] = control.value
    })
    setControlValues(defaultControls)
    onPreview(preset, defaultControls)
  }

  const handleControlChange = (controlId: string, value: string | number) => {
    const newValues = { ...controlValues, [controlId]: value }
    setControlValues(newValues)
    if (selectedPreset) {
      onPreview(selectedPreset, newValues)
    }
  }

  const handleSave = async () => {
    if (!selectedPreset) return
    setIsSaving(true)
    try {
      await onSave(selectedPreset.id, controlValues)
      onClose()
    } catch (error) {
      console.error('Failed to save background preference:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      await onSave('', {})
      onClose()
    } catch (error) {
      console.error('Failed to reset background:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Background Gallery</h2>
                <p className="text-sm text-gray-500">Choose a background that sets the perfect mood</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 min-h-0">
            {/* Presets Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div 
                className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {backgroundPresets.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      'relative aspect-video rounded-xl overflow-hidden border-2 transition-all',
                      selectedPreset?.id === preset.id
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className="absolute inset-0"
                      style={applyPresetControls(preset, preset.controls?.reduce((acc, control) => {
                        acc[control.id] = control.value
                        return acc
                      }, {} as Record<string, string | number>) || {})}
                    />
                    {/* Animations disabled - no animation preview */}
                    <div className="absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <h3 className="text-sm font-medium text-white">{preset.name}</h3>
                      <p className="text-xs text-white/80 mt-0.5">{preset.description}</p>
                      {preset.controls && preset.controls.filter(c => c.type === 'color').length > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs text-white/90">🎨</span>
                          <span className="text-xs text-white/90">
                            {preset.controls.filter(c => c.type === 'color').length} color{preset.controls.filter(c => c.type === 'color').length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedPreset?.id === preset.id && (
                      <div className="absolute top-2 right-2 p-1.5 bg-purple-500 rounded-full">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {currentPresetId === preset.id && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                          Current
                        </span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Controls Panel */}
            {selectedPreset && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-80 border-l border-gray-100 bg-gray-50/50 flex flex-col"
              >
                <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {selectedPreset.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedPreset.description}
                    </p>
                    {selectedPreset.controls && selectedPreset.controls.filter(c => c.type === 'color').length > 0 && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-700 font-medium">
                          🎨 This preset has {selectedPreset.controls.filter(c => c.type === 'color').length} customizable color{selectedPreset.controls.filter(c => c.type === 'color').length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedPreset.controls && selectedPreset.controls.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>Customize Colors & Settings</span>
                      </div>
                      {/* Color Controls */}
                      {selectedPreset.controls.filter(c => c.type === 'color').length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Colors
                            </div>
                            <div className="text-xs text-purple-600 font-medium">
                              {selectedPreset.controls.filter(c => c.type === 'color').length} color{selectedPreset.controls.filter(c => c.type === 'color').length > 1 ? 's' : ''}
                            </div>
                          </div>
                          {selectedPreset.controls.filter(c => c.type === 'color').map((control, index) => (
                            <motion.div 
                              key={control.id} 
                              className="space-y-2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <label className="text-xs font-medium text-gray-700">
                                {control.label}
                              </label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={controlValues[control.id] as string || control.value}
                                    onChange={(e) => handleControlChange(control.id, e.target.value)}
                                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-colors shadow-sm"
                                  />
                                  <input
                                    type="text"
                                    value={controlValues[control.id] as string || control.value}
                                    onChange={(e) => handleControlChange(control.id, e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                    placeholder="#000000"
                                  />
                                </div>
                                {/* Color preview */}
                                <div 
                                  className="w-full h-6 rounded-lg border border-gray-200 shadow-sm"
                                  style={{ backgroundColor: (controlValues[control.id] as string) || (control.value as string) }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Other Controls */}
                      {selectedPreset.controls.filter(c => c.type !== 'color').length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Settings
                          </div>
                          {selectedPreset.controls.filter(c => c.type !== 'color').map((control) => (
                            <div key={control.id} className="space-y-2">
                              <label className="text-xs font-medium text-gray-700">
                                {control.label}
                              </label>
                              {control.type === 'range' && (
                                <div className="space-y-1">
                                  <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={control.step}
                                    value={controlValues[control.id] as number || control.value}
                                    onChange={(e) => handleControlChange(control.id, parseFloat(e.target.value))}
                                    className="w-full accent-purple-500"
                                  />
                                  <div className="flex justify-between text-xs text-gray-400">
                                    <span>{control.min}</span>
                                    <span className="font-medium text-gray-700">
                                      {controlValues[control.id] || control.value}
                                    </span>
                                    <span>{control.max}</span>
                                  </div>
                                </div>
                              )}
                              {control.type === 'select' && control.options && (
                                <select
                                  value={controlValues[control.id] as string || control.value}
                                  onChange={(e) => handleControlChange(control.id, e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {control.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {prefersReducedMotion && selectedPreset.animation && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        Animation paused (reduced motion preference detected)
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Use Default
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedPreset || isSaving}
                className={cn(
                  'px-6 py-2 text-sm font-medium text-white rounded-lg transition-all',
                  selectedPreset && !isSaving
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                {isSaving ? 'Saving...' : 'Save Background'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}