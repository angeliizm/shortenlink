'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, X, Check, RotateCcw } from 'lucide-react'
import { backgroundPresets, applyPresetControls, type BackgroundPreset } from '@/lib/background-presets'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface BackgroundSelectorProps {
  siteId: string
  currentPresetId?: string
  currentControls?: Record<string, string | number>
  onSave: (presetId: string, controls: Record<string, string | number>) => Promise<void>
  onClose: () => void
}

export function BackgroundSelector({
  siteId,
  currentPresetId,
  currentControls = {},
  onSave,
  onClose,
}: BackgroundSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset | null>(
    currentPresetId ? backgroundPresets.find(p => p.id === currentPresetId) || null : null
  )
  const [controlValues, setControlValues] = useState<Record<string, string | number>>(currentControls)
  const [isSaving, setIsSaving] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const { toast } = useToast()

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
  }

  const handleControlChange = (controlId: string, value: string | number) => {
    const newValues = { ...controlValues, [controlId]: value }
    setControlValues(newValues)
  }

  const handleSave = async () => {
    if (!selectedPreset) return
    setIsSaving(true)
    try {
      await onSave(selectedPreset.id, controlValues)
      toast({
        title: "Background updated",
        description: `Applied "${selectedPreset.name}" to your site`,
      })
      // Reset state before closing
      setSelectedPreset(null)
      setControlValues({})
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save background preference",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      await onSave('', {})
      toast({
        title: "Back to default",
        description: "Background has been reset",
      })
      // Reset state before closing
      setSelectedPreset(null)
      setControlValues({})
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset background",
        variant: "destructive",
      })
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Choose a background</h2>
              <p className="text-sm text-gray-500">Set the mood for this site</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Preview Stage */}
            <div className="mb-6">
              <div 
                className="h-32 rounded-lg border border-gray-200 relative overflow-hidden"
                style={selectedPreset ? applyPresetControls(selectedPreset, controlValues) : {
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                }}
              >
                {selectedPreset?.animation && !prefersReducedMotion && (
                  <div className="absolute inset-0 animate-pulse opacity-50" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedPreset ? selectedPreset.name : 'Default Background'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
              {backgroundPresets.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    selectedPreset?.id === preset.id
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div
                    className="absolute inset-0"
                    style={applyPresetControls(preset, {})}
                  />
                  {selectedPreset?.id === preset.id && (
                    <div className="absolute top-1 right-1 p-0.5 bg-blue-500 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {currentPresetId === preset.id && (
                    <div className="absolute top-1 left-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Controls */}
            {selectedPreset?.controls && selectedPreset.controls.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customize</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPreset.controls.map((control) => (
                    <div key={control.id} className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        {control.label}
                      </label>
                      {control.type === 'color' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={controlValues[control.id] as string || control.value}
                            onChange={(e) => handleControlChange(control.id, e.target.value)}
                            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={controlValues[control.id] as string || control.value}
                            onChange={(e) => handleControlChange(control.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      {control.type === 'range' && (
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={controlValues[control.id] as number || control.value}
                            onChange={(e) => handleControlChange(control.id, parseFloat(e.target.value))}
                            className="w-full h-1 accent-blue-500"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{control.min}</span>
                            <span className="font-medium text-gray-600">
                              {controlValues[control.id] || control.value}
                            </span>
                            <span>{control.max}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Use default
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedPreset || isSaving}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-all',
                  selectedPreset && !isSaving
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}