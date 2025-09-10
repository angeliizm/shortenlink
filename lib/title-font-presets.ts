export interface TitleFontPreset {
  id: string
  name: string
  fontFamily: string
  fontWeight: string
  letterSpacing: string
}

export const titleFontPresets: TitleFontPreset[] = [
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    fontFamily: 'Georgia, Times, serif',
    fontWeight: '400',
    letterSpacing: '0.02em'
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    fontFamily: 'Garamond, Georgia, serif',
    fontWeight: '300',
    letterSpacing: '0.05em'
  },
  {
    id: 'bold-serif',
    name: 'Bold Serif',
    fontFamily: 'Georgia, Times, serif',
    fontWeight: '700',
    letterSpacing: '-0.01em'
  },
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '600',
    letterSpacing: '-0.02em'
  },
  {
    id: 'thin-modern',
    name: 'Thin Modern',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '100',
    letterSpacing: '0.08em'
  },
  {
    id: 'tech-mono',
    name: 'Tech Mono',
    fontFamily: 'Menlo, Monaco, Consolas, monospace',
    fontWeight: '500',
    letterSpacing: '0.03em'
  },
  {
    id: 'retro-mono',
    name: 'Retro Mono',
    fontFamily: 'Courier New, Courier, monospace',
    fontWeight: '700',
    letterSpacing: '0.1em'
  },
  {
    id: 'display-bold',
    name: 'Display Bold',
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: '900',
    letterSpacing: '-0.05em'
  },
  {
    id: 'rounded-friendly',
    name: 'Rounded Friendly',
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontWeight: '600',
    letterSpacing: '0.01em'
  },
  {
    id: 'elegant-light',
    name: 'Elegant Light',
    fontFamily: 'Optima, Segoe, sans-serif',
    fontWeight: '300',
    letterSpacing: '0.06em'
  },
  {
    id: 'corporate-strong',
    name: 'Corporate Strong',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontWeight: '700',
    letterSpacing: '-0.01em'
  },
  {
    id: 'artistic-script',
    name: 'Artistic Script',
    fontFamily: 'Brush Script MT, cursive',
    fontWeight: '400',
    letterSpacing: '0.02em'
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    fontFamily: 'Orbitron, Futura, sans-serif',
    fontWeight: '600',
    letterSpacing: '0.04em'
  },
  {
    id: 'vintage-typewriter',
    name: 'Vintage Typewriter',
    fontFamily: 'American Typewriter, Courier, monospace',
    fontWeight: '400',
    letterSpacing: '0.05em'
  },
  {
    id: 'newspaper-bold',
    name: 'Newspaper Bold',
    fontFamily: 'Times New Roman, Times, serif',
    fontWeight: '800',
    letterSpacing: '-0.02em'
  },
  {
    id: 'playful-round',
    name: 'Playful Round',
    fontFamily: 'Comic Sans MS, cursive',
    fontWeight: '600',
    letterSpacing: '0.01em'
  },
  {
    id: 'minimal-thin',
    name: 'Minimal Thin',
    fontFamily: 'Lato, Helvetica, sans-serif',
    fontWeight: '200',
    letterSpacing: '0.12em'
  },
  {
    id: 'luxury-serif',
    name: 'Luxury Serif',
    fontFamily: 'Baskerville, Georgia, serif',
    fontWeight: '500',
    letterSpacing: '0.03em'
  },
  {
    id: 'tech-sans',
    name: 'Tech Sans',
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeight: '500',
    letterSpacing: '0.01em'
  },
  {
    id: 'handwritten',
    name: 'Handwritten',
    fontFamily: 'Marker Felt, fantasy',
    fontWeight: '400',
    letterSpacing: '0.02em'
  }
]

export function getTitleFontPresetById(id: string): TitleFontPreset | undefined {
  return titleFontPresets.find(preset => preset.id === id)
}

export const defaultTitleFontPresetId = 'modern-sans'
