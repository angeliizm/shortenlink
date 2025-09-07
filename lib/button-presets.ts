export interface ButtonPreset {
  id: string
  name: string
  styles: {
    backgroundColor: string
    color: string
    borderColor?: string
    borderWidth?: string
    hoverBackgroundColor?: string
    hoverTextColor?: string
    hoverBorderColor?: string
  }
}

export const buttonPresets: ButtonPreset[] = [
  {
    id: 'solid-blue',
    name: 'Solid Blue',
    styles: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#2563EB',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-green',
    name: 'Solid Green',
    styles: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#059669',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-red',
    name: 'Solid Red',
    styles: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#DC2626',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-amber',
    name: 'Solid Amber',
    styles: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#D97706',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-purple',
    name: 'Solid Purple',
    styles: {
      backgroundColor: '#8B5CF6',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#7C3AED',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-black',
    name: 'Solid Black',
    styles: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: '#1F2937',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'outline-gray',
    name: 'Outline Gray',
    styles: {
      backgroundColor: 'transparent',
      color: '#4B5563',
      borderColor: '#D1D5DB',
      borderWidth: '2px',
      hoverBackgroundColor: '#F9FAFB',
      hoverTextColor: '#1F2937',
      hoverBorderColor: '#9CA3AF'
    }
  },
  {
    id: 'outline-blue',
    name: 'Outline Blue',
    styles: {
      backgroundColor: 'transparent',
      color: '#3B82F6',
      borderColor: '#3B82F6',
      borderWidth: '2px',
      hoverBackgroundColor: '#EFF6FF',
      hoverTextColor: '#2563EB',
      hoverBorderColor: '#2563EB'
    }
  },
  {
    id: 'ghost',
    name: 'Ghost',
    styles: {
      backgroundColor: 'transparent',
      color: '#6B7280',
      borderWidth: '0',
      hoverBackgroundColor: '#F3F4F6',
      hoverTextColor: '#374151'
    }
  },
  {
    id: 'link',
    name: 'Link',
    styles: {
      backgroundColor: 'transparent',
      color: '#3B82F6',
      borderWidth: '0',
      hoverBackgroundColor: 'transparent',
      hoverTextColor: '#2563EB'
    }
  },
  {
    id: 'gradient-blue',
    name: 'Gradient Blue',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      color: '#FFFFFF',
      borderWidth: '0',
      hoverBackgroundColor: 'linear-gradient(135deg, #5A67D8 0%, #6B46A2 100%)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'gradient-green',
    name: 'Gradient Green',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)',
      color: '#1F2937',
      borderWidth: '0',
      hoverBackgroundColor: 'linear-gradient(135deg, #6EE7A7 0%, #7AC7E8 100%)',
      hoverTextColor: '#111827'
    }
  }
]

export function getPresetById(id: string): ButtonPreset | undefined {
  return buttonPresets.find(preset => preset.id === id)
}

export const defaultPresetId = 'outline-gray'