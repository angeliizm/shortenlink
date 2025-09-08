export interface BackgroundPreset {
  id: string
  name: string
  description: string
  style: React.CSSProperties
  animation?: string
  animationCSS?: string
  controls?: PresetControl[]
}

export interface PresetControl {
  id: string
  label: string
  type: 'color' | 'range' | 'select'
  value: string | number
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  step?: number
}

export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'clean-solid',
    name: 'Clean Solid',
    description: 'Minimal, brand-first flat color',
    style: {
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
    },
    controls: [
      {
        id: 'color',
        label: 'Color',
        type: 'color',
        value: '#f8f9fa',
      },
    ],
  },
  {
    id: 'duo-gradient',
    name: 'Duo Gradient',
    description: 'Soft two-tone flow, elegant and modern',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Color 1',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'color2',
        label: 'Color 2',
        type: 'color',
        value: '#764ba2',
      },
    ],
  },
  {
    id: 'radial-glow',
    name: 'Radial Glow',
    description: 'Gentle center glow that frames content',
    style: {
      background: 'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
      backgroundColor: '#fafbfc',
    },
    controls: [
      {
        id: 'glowColor',
        label: 'Glow Color',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'intensity',
        label: 'Intensity',
        type: 'range',
        value: 0.1,
        min: 0,
        max: 0.3,
        step: 0.01,
      },
    ],
  },
  {
    id: 'paper-noise',
    name: 'Paper Noise',
    description: 'Subtle texture, tactile and warm',
    style: {
      backgroundColor: '#fefefe',
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
    },
    controls: [
      {
        id: 'warmth',
        label: 'Warmth',
        type: 'range',
        value: 0,
        min: -10,
        max: 10,
        step: 1,
      },
    ],
  },
  {
    id: 'diagonal-stripes',
    name: 'Diagonal Stripes',
    description: 'Crisp editorial energy',
    style: {
      backgroundColor: '#ffffff',
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 0, 0, 0.01) 10px,
        rgba(0, 0, 0, 0.01) 20px
      )`,
    },
    controls: [
      {
        id: 'thickness',
        label: 'Stripe Width',
        type: 'range',
        value: 10,
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    id: 'micro-dots',
    name: 'Micro Dots',
    description: 'Delicate tech feel, airy',
    style: {
      backgroundColor: '#fafbfc',
      backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    },
    controls: [
      {
        id: 'dotSize',
        label: 'Dot Size',
        type: 'range',
        value: 20,
        min: 10,
        max: 40,
        step: 5,
      },
    ],
  },
  {
    id: 'living-gradient',
    name: 'Living Gradient',
    description: 'Slow, breathing color shift',
    style: {
      background: 'linear-gradient(270deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
    },
    animation: 'gradientShift',
    animationCSS: `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `,
    controls: [
      {
        id: 'speed',
        label: 'Animation Speed',
        type: 'range',
        value: 15,
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    id: 'liquid-waves',
    name: 'Liquid Waves',
    description: 'Softly drifting curves',
    style: {
      backgroundColor: '#f0f4f8',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%239C92AC' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    },
    animation: 'waveFlow',
    animationCSS: `
      @keyframes waveFlow {
        0% { background-position-x: 0; }
        100% { background-position-x: 100px; }
      }
    `,
    controls: [
      {
        id: 'waveSpeed',
        label: 'Wave Speed',
        type: 'range',
        value: 10,
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    description: 'Tiny drifting specks, dreamy night',
    style: {
      background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    },
    animation: 'firefly',
    animationCSS: `
      @keyframes firefly {
        0% { transform: translate(0, 0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translate(100vw, -100vh); opacity: 0; }
      }
    `,
    controls: [
      {
        id: 'density',
        label: 'Firefly Count',
        type: 'range',
        value: 10,
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
  {
    id: 'aurora-veil',
    name: 'Aurora Veil',
    description: 'Silky color clouds, cinematic',
    style: {
      background: `
        radial-gradient(ellipse at top left, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at top right, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(255, 206, 84, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
        linear-gradient(180deg, #fafbfc 0%, #e9ecef 100%)
      `,
    },
    animation: 'auroraDrift',
    animationCSS: `
      @keyframes auroraDrift {
        0%, 100% { transform: rotate(0deg) scale(1); }
        33% { transform: rotate(1deg) scale(1.01); }
        66% { transform: rotate(-1deg) scale(1.01); }
      }
    `,
    controls: [
      {
        id: 'intensity',
        label: 'Aurora Intensity',
        type: 'range',
        value: 0.3,
        min: 0.1,
        max: 0.5,
        step: 0.1,
      },
    ],
  },
]

export function applyPresetControls(
  preset: BackgroundPreset,
  controlValues: Record<string, string | number>
): React.CSSProperties {
  let style = { ...preset.style }
  
  // Apply control-specific modifications
  switch (preset.id) {
    case 'clean-solid':
      if (controlValues.color) {
        style.background = `linear-gradient(180deg, ${controlValues.color} 0%, ${adjustBrightness(controlValues.color as string, -10)} 100%)`
      }
      break
      
    case 'duo-gradient':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#667eea') as string
        const c2 = (controlValues.color2 || '#764ba2') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'radial-glow':
      if (controlValues.glowColor || controlValues.intensity !== undefined) {
        const color = (controlValues.glowColor || '#667eea') as string
        const intensity = (controlValues.intensity || 0.1) as number
        style.background = `radial-gradient(ellipse at center, ${hexToRgba(color, intensity)} 0%, rgba(255, 255, 255, 0) 70%)`
      }
      break
      
    case 'paper-noise':
      if (controlValues.warmth !== undefined) {
        const warmth = controlValues.warmth as number
        const r = 254 + warmth
        const g = 254 + Math.floor(warmth * 0.7)
        const b = 254 - warmth
        style.backgroundColor = `rgb(${Math.min(255, Math.max(240, r))}, ${Math.min(255, Math.max(240, g))}, ${Math.min(255, Math.max(240, b))})`
      }
      break
      
    case 'diagonal-stripes':
      if (controlValues.thickness) {
        const width = controlValues.thickness as number
        style.backgroundImage = `repeating-linear-gradient(
          45deg,
          transparent,
          transparent ${width}px,
          rgba(0, 0, 0, 0.01) ${width}px,
          rgba(0, 0, 0, 0.01) ${width * 2}px
        )`
      }
      break
      
    case 'micro-dots':
      if (controlValues.dotSize) {
        style.backgroundSize = `${controlValues.dotSize}px ${controlValues.dotSize}px`
      }
      break
  }
  
  return style
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`
}