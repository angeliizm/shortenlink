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
    id: 'clean-sans',
    name: 'Clean Sans',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '400',
    letterSpacing: '0em'
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans',
    fontFamily: 'Inter, Helvetica, sans-serif',
    fontWeight: '800',
    letterSpacing: '-0.05em'
  },
  {
    id: 'tech-mono',
    name: 'Tech Mono',
    fontFamily: 'Monaco, Consolas, monospace',
    fontWeight: '500',
    letterSpacing: '0.05em'
  },
  {
    id: 'code-mono',
    name: 'Code Mono',
    fontFamily: 'Fira Code, Monaco, monospace',
    fontWeight: '400',
    letterSpacing: '0.1em'
  },
  {
    id: 'display-mono',
    name: 'Display Mono',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '700',
    letterSpacing: '-0.05em'
  },
  {
    id: 'luxury-display',
    name: 'Luxury Display',
    fontFamily: 'Playfair Display, serif',
    fontWeight: '600',
    letterSpacing: '0.03em'
  },
  {
    id: 'modern-display',
    name: 'Modern Display',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '700',
    letterSpacing: '-0.02em'
  },
  {
    id: 'creative-display',
    name: 'Creative Display',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: '800',
    letterSpacing: '-0.03em'
  },
  // Retro Font Presets
  {
    id: 'retro-neon',
    name: 'Retro Neon',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '900',
    letterSpacing: '0.1em'
  },
  {
    id: 'vintage-poster',
    name: 'Vintage Poster',
    fontFamily: 'Bebas Neue, sans-serif',
    fontWeight: '400',
    letterSpacing: '0.05em'
  },
  {
    id: 'retro-gaming',
    name: 'Retro Gaming',
    fontFamily: 'Press Start 2P, monospace',
    fontWeight: '400',
    letterSpacing: '0.02em'
  },
  {
    id: 'disco-era',
    name: 'Disco Era',
    fontFamily: 'Fredoka One, cursive',
    fontWeight: '400',
    letterSpacing: '0.03em'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: '700',
    letterSpacing: '0.08em'
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    fontFamily: 'Righteous, cursive',
    fontWeight: '400',
    letterSpacing: '0.04em'
  },
  {
    id: 'vintage-sign',
    name: 'Vintage Sign',
    fontFamily: 'Creepster, cursive',
    fontWeight: '400',
    letterSpacing: '0.06em'
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '700',
    letterSpacing: '0.12em'
  },
  {
    id: 'retro-comic',
    name: 'Retro Comic',
    fontFamily: 'Bangers, cursive',
    fontWeight: '400',
    letterSpacing: '0.02em'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '600',
    letterSpacing: '0.15em'
  }
]

export const defaultTitleFontPresetId = 'modern-sans'

export function getTitleFontPresetById(id: string): TitleFontPreset | undefined {
  return titleFontPresets.find(preset => preset.id === id)
}