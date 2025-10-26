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
    borderStyle?: string
    borderRadius?: string
    shadow?: string
    gradient?: boolean
    pattern?: string
  }
  bannerImage?: string  // Path to banner image for banner-type presets
}

export const buttonPresets: ButtonPreset[] = [
  {
    id: 'amg-banner',
    name: 'AMG Banner',
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderWidth: '0px',
      borderRadius: '12px',
    },
    bannerImage: '/images/amgbanner.png'
  },
  {
    id: 'merso-banner',
    name: 'Merso Banner',
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderWidth: '0px',
      borderRadius: '12px',
    },
    bannerImage: '/images/mersobanner.gif'
  },
  {
    id: 'hojabet-banner',
    name: 'Hojabet Banner',
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderWidth: '0px',
      borderRadius: '12px',
    },
    bannerImage: '/images/hojabet.png'
  },
  {
    id: 'vaycasino-banner',
    name: 'VayCasino Banner',
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderWidth: '0px',
      borderRadius: '12px',
    },
    bannerImage: '/images/vaycasinobanner.png'
  },
  {
    id: 'sheraton-banner',
    name: 'Sheraton Banner',
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderWidth: '0px',
      borderRadius: '12px',
    },
    bannerImage: '/images/sheratonbanner.png'
  },
  {
    id: 'dashed-modern',
    name: 'Modern Dashed',
    styles: {
      backgroundColor: '#FFFFFF',
      color: '#6366F1',
      hoverBackgroundColor: '#6366F1',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'solid-gradient',
    name: 'Gradient Magic',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      borderWidth: '0',
      borderRadius: '16px',
      gradient: true,
      hoverBackgroundColor: 'linear-gradient(135deg, #5a67d8 0%, #6b46a2 100%)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    styles: {
      backgroundColor: '#000000',
      color: '#00FF88',
      borderWidth: '2px',
      borderStyle: 'solid',
      shadow: '0 0 20px #00FF8840',
      hoverBackgroundColor: '#00FF88',
      hoverTextColor: '#000000'
    }
  },
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#1F2937',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.25)',
      hoverTextColor: '#111827'
    }
  },
  {
    id: 'retro-pixel',
    name: 'Retro Pixel',
    styles: {
      backgroundColor: '#FF6B6B',
      color: '#FFFFFF',
      borderWidth: '4px',
      borderStyle: 'solid',
      borderRadius: '0px',
      shadow: '4px 4px 0px #45B7B8',
      hoverBackgroundColor: '#4ECDC4',
      hoverTextColor: '#FFFFFF',
    }
  },
  {
    id: 'minimal-line',
    name: 'Minimal Line',
    styles: {
      backgroundColor: 'transparent',
      color: '#374151',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      hoverBackgroundColor: '#F9FAFB',
      hoverTextColor: '#111827',
    }
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Vibes',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      color: '#8B5CF6',
      borderWidth: '0',
      borderRadius: '20px',
      gradient: true,
      hoverBackgroundColor: 'linear-gradient(135deg, #ff8a95 0%, #fdb8e8 50%, #fdb8e8 100%)',
      hoverTextColor: '#7C3AED'
    }
  },
  {
    id: 'cyber-punk',
    name: 'Cyber Punk',
    styles: {
      backgroundColor: '#0F0F23',
      color: '#FF0080',
      borderWidth: '2px',
      borderStyle: 'solid',
      shadow: '0 0 15px #FF008040, inset 0 0 15px #FF008020',
      hoverBackgroundColor: '#FF0080',
      hoverTextColor: '#0F0F23',
    }
  },
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    styles: {
      backgroundColor: '#F0FDF4',
      color: '#15803D',
      borderWidth: '3px',
      borderStyle: 'dashed',
      borderRadius: '25px',
      hoverBackgroundColor: '#22C55E',
      hoverTextColor: '#FFFFFF',
    }
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#1A1A1A',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '12px',
      shadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
      gradient: true,
      hoverBackgroundColor: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      hoverTextColor: '#000000',
    }
  },
  {
    id: 'paper-cutout',
    name: 'Paper Cutout',
    styles: {
      backgroundColor: '#FEFEFE',
      color: '#2D3748',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '8px',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      hoverBackgroundColor: '#F7FAFC',
      hoverTextColor: '#1A202C',
    }
  },
  {
    id: 'holographic',
    name: 'Holographic',
    styles: {
      backgroundColor: 'linear-gradient(45deg, #ff0099, #493240, #f93943, #e65c00, #f9ca24)',
      color: '#FFFFFF',
      borderWidth: '0',
      borderRadius: '14px',
      gradient: true,
      shadow: '0 8px 16px rgba(255, 0, 153, 0.3)',
      hoverBackgroundColor: 'linear-gradient(45deg, #e6008a, #3e2b36, #e0343a, #cc5200, #e0b61e)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)',
      color: '#FFFFFF',
      borderWidth: '0',
      borderRadius: '18px',
      gradient: true,
      shadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
      hoverBackgroundColor: 'linear-gradient(135deg, #5a67d8 0%, #6b46a2 50%, #4299e1 100%)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'fire-flame',
    name: 'Fire Flame',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #ff4757 100%)',
      color: '#FFFFFF',
      borderWidth: '0',
      borderRadius: '16px',
      gradient: true,
      shadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
      hoverBackgroundColor: 'linear-gradient(135deg, #ff5252 0%, #ff9500 50%, #ff3742 100%)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'vintage-stamp',
    name: 'Vintage Stamp',
    styles: {
      backgroundColor: '#F7F3E9',
      color: '#8B4513',
      borderWidth: '3px',
      borderStyle: 'dashed',
      borderRadius: '4px',
      shadow: 'inset 0 0 0 2px #D2B48C, 0 2px 4px rgba(139, 69, 19, 0.2)',
      hoverBackgroundColor: '#8B4513',
      hoverTextColor: '#F7F3E9',
    }
  },
  {
    id: 'matrix-code',
    name: 'Matrix Code',
    styles: {
      backgroundColor: '#000000',
      color: '#00FF41',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      shadow: '0 0 10px #00FF41, inset 0 0 10px rgba(0, 255, 65, 0.1)',
      hoverBackgroundColor: '#001100',
      hoverTextColor: '#00FF41',
    }
  },
  {
    id: 'bubble-pop',
    name: 'Bubble Pop',
    styles: {
      backgroundColor: '#FFE4E1',
      color: '#FF69B4',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '50px',
      shadow: '0 4px 15px rgba(255, 105, 180, 0.3)',
      hoverBackgroundColor: '#FF69B4',
      hoverTextColor: '#FFFFFF',
    }
  },
  {
    id: 'industrial-metal',
    name: 'Industrial Metal',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
      color: '#ECF0F1',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '8px',
      gradient: true,
      shadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.3)',
      hoverBackgroundColor: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)',
      hoverTextColor: '#FFFFFF',
    }
  },
  {
    id: 'cosmic-space',
    name: 'Cosmic Space',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      color: '#FFFFFF',
      borderWidth: '0',
      borderRadius: '20px',
      gradient: true,
      shadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      hoverBackgroundColor: 'linear-gradient(135deg, #5a67d8 0%, #6b46a2 25%, #e084f0 50%, #f04a67 75%, #4299e1 100%)',
      hoverTextColor: '#FFFFFF'
    }
  },
  {
    id: 'wood-carved',
    name: 'Wood Carved',
    styles: {
      backgroundColor: '#D2691E',
      color: '#8B4513',
      borderWidth: '3px',
      borderStyle: 'solid',
      borderRadius: '12px',
      shadow: 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.1)',
      hoverBackgroundColor: '#CD853F',
      hoverTextColor: '#654321',
    }
  },
  {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    styles: {
      backgroundColor: '#1a1a2e',
      color: '#ff006e',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '0px',
      shadow: '0 0 20px #ff006e, 0 0 40px #ff006e, 0 0 80px #ff006e',
      hoverBackgroundColor: '#ff006e',
      hoverTextColor: '#1a1a2e',
    }
  },
  {
    id: 'candy-sweet',
    name: 'Candy Sweet',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      color: '#8B5A8C',
      borderWidth: '0',
      borderRadius: '25px',
      gradient: true,
      shadow: '0 6px 20px rgba(255, 154, 158, 0.4)',
      hoverBackgroundColor: 'linear-gradient(135deg, #ff8a95 0%, #fdb8e8 50%, #fdb8e8 100%)',
      hoverTextColor: '#7C3A7C'
    }
  },
  {
    id: 'military-tactical',
    name: 'Military Tactical',
    styles: {
      backgroundColor: '#2F4F2F',
      color: '#F0E68C',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '4px',
      shadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
      hoverBackgroundColor: '#556B2F',
      hoverTextColor: '#FFFFFF',
    }
  },
  {
    id: 'ice-crystal',
    name: 'Ice Crystal',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #E0F6FF 0%, #B3E5FC 100%)',
      color: '#0277BD',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '14px',
      gradient: true,
      shadow: '0 4px 20px rgba(129, 212, 250, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      hoverBackgroundColor: 'linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)',
      hoverTextColor: '#01579B',
    }
  },
  {
    id: 'electric-shock',
    name: 'Electric Shock',
    styles: {
      backgroundColor: '#000000',
      color: '#FFFF00',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '8px',
      shadow: '0 0 15px #FFFF00, inset 0 0 15px rgba(255, 255, 0, 0.1)',
      hoverBackgroundColor: '#FFFF00',
      hoverTextColor: '#000000',
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    styles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '12px',
      gradient: true,
      shadow: '0 6px 20px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.3)',
      hoverBackgroundColor: 'linear-gradient(135deg, #5a67d8 0%, #6b46a2 100%)',
      hoverTextColor: '#FFFFFF',
    }
  }
]

export function getPresetById(id: string): ButtonPreset | undefined {
  return buttonPresets.find(preset => preset.id === id)
}

export const defaultPresetId = 'dashed-modern'