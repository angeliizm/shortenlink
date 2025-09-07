'use client'

import { buttonPresets, getPresetById } from '@/lib/button-presets'

interface PresetSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PresetSelector({ value, onChange, className = '' }: PresetSelectorProps) {
  const currentPreset = getPresetById(value)
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-3 py-2 border rounded-md bg-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {buttonPresets.map(preset => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      
      {/* Live preview */}
      {currentPreset && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <div 
            className="px-2 py-0.5 text-xs font-medium rounded"
            style={{
              background: currentPreset.styles.backgroundColor,
              color: currentPreset.styles.color,
              border: currentPreset.styles.borderWidth ? `${currentPreset.styles.borderWidth} solid ${currentPreset.styles.borderColor || 'transparent'}` : 'none',
              minWidth: '28px',
              textAlign: 'center'
            }}
          >
            Aa
          </div>
        </div>
      )}
      
      {/* Dropdown arrow */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}