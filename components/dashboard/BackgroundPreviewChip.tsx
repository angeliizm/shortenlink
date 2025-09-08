'use client'

import { backgroundPresets, applyPresetControls } from '@/lib/background-presets'
import { cn } from '@/lib/utils'

interface BackgroundPreviewChipProps {
  presetId?: string
  controlValues?: Record<string, string | number>
  className?: string
}

export function BackgroundPreviewChip({
  presetId,
  controlValues = {},
  className
}: BackgroundPreviewChipProps) {
  const preset = presetId ? backgroundPresets.find(p => p.id === presetId) : null
  
  if (!preset) {
    return (
      <div 
        className={cn(
          "w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300",
          className
        )}
        title="Default background"
      />
    )
  }

  const style = applyPresetControls(preset, controlValues)
  
  return (
    <div className="relative group">
      <div 
        className={cn(
          "w-8 h-8 rounded-md border border-gray-300 shadow-sm",
          className
        )}
        style={style}
        title={preset.name}
      />
      {/* Tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {preset.name}
      </div>
    </div>
  )
}