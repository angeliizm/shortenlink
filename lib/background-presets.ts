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
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#fefefe',
      },
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
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#ffffff',
      },
      {
        id: 'stripeColor',
        label: 'Stripe Color',
        type: 'color',
        value: '#000000',
      },
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
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#fafbfc',
      },
      {
        id: 'dotColor',
        label: 'Dot Color',
        type: 'color',
        value: '#000000',
      },
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
        id: 'color1',
        label: 'Color 1',
        type: 'color',
        value: '#ee7752',
      },
      {
        id: 'color2',
        label: 'Color 2',
        type: 'color',
        value: '#e73c7e',
      },
      {
        id: 'color3',
        label: 'Color 3',
        type: 'color',
        value: '#23a6d5',
      },
      {
        id: 'color4',
        label: 'Color 4',
        type: 'color',
        value: '#23d5ab',
      },
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
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#f0f4f8',
      },
      {
        id: 'waveColor',
        label: 'Wave Color',
        type: 'color',
        value: '#9C92AC',
      },
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
        id: 'color1',
        label: 'Top Color',
        type: 'color',
        value: '#0f0c29',
      },
      {
        id: 'color2',
        label: 'Middle Color',
        type: 'color',
        value: '#302b63',
      },
      {
        id: 'color3',
        label: 'Bottom Color',
        type: 'color',
        value: '#24243e',
      },
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
        id: 'baseColor1',
        label: 'Base Color 1',
        type: 'color',
        value: '#fafbfc',
      },
      {
        id: 'baseColor2',
        label: 'Base Color 2',
        type: 'color',
        value: '#e9ecef',
      },
      {
        id: 'auroraColor1',
        label: 'Aurora Color 1',
        type: 'color',
        value: '#7877C6',
      },
      {
        id: 'auroraColor2',
        label: 'Aurora Color 2',
        type: 'color',
        value: '#FF77C6',
      },
      {
        id: 'auroraColor3',
        label: 'Aurora Color 3',
        type: 'color',
        value: '#FFCE54',
      },
      {
        id: 'auroraColor4',
        label: 'Aurora Color 4',
        type: 'color',
        value: '#78DBFF',
      },
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
  {
    id: 'floating-orbs',
    name: 'Floating Orbs',
    description: 'Smooth floating bubbles, dreamy and elegant',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden',
    },
    animation: 'orbFloat',
    animationCSS: `
      @keyframes orbFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(120deg); }
        66% { transform: translateY(10px) rotate(240deg); }
      }
    `,
    controls: [
      {
        id: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'secondaryColor',
        label: 'Secondary Color',
        type: 'color',
        value: '#764ba2',
      },
      {
        id: 'orbColor',
        label: 'Orb Color',
        type: 'color',
        value: '#ffffff',
      },
      {
        id: 'speed',
        label: 'Float Speed',
        type: 'range',
        value: 8,
        min: 4,
        max: 16,
        step: 2,
      },
    ],
  },
  {
    id: 'pulse-waves',
    name: 'Pulse Waves',
    description: 'Rhythmic expanding circles, hypnotic flow',
    style: {
      backgroundColor: '#1a1a2e',
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.2) 0%, transparent 50%)`,
    },
    animation: 'pulseWave',
    animationCSS: `
      @keyframes pulseWave {
        0% { transform: scale(0.8); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `,
    controls: [
      {
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#1a1a2e',
      },
      {
        id: 'waveColor',
        label: 'Wave Color',
        type: 'color',
        value: '#4facfe',
      },
      {
        id: 'intensity',
        label: 'Wave Intensity',
        type: 'range',
        value: 0.2,
        min: 0.1,
        max: 0.5,
        step: 0.05,
      },
      {
        id: 'speed',
        label: 'Pulse Speed',
        type: 'range',
        value: 3,
        min: 1,
        max: 6,
        step: 1,
      },
    ],
  },
  {
    id: 'cosmic-dust',
    name: 'Cosmic Dust',
    description: 'Sparkling particles in space, magical atmosphere',
    style: {
      background: 'radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%)',
    },
    animation: 'starTwinkle',
    animationCSS: `
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
      }
    `,
    controls: [
      {
        id: 'spaceColor1',
        label: 'Space Color 1',
        type: 'color',
        value: '#0f0f23',
      },
      {
        id: 'spaceColor2',
        label: 'Space Color 2',
        type: 'color',
        value: '#000000',
      },
      {
        id: 'dustColor',
        label: 'Dust Color',
        type: 'color',
        value: '#ffffff',
      },
      {
        id: 'sparkleSpeed',
        label: 'Sparkle Speed',
        type: 'range',
        value: 4,
        min: 2,
        max: 8,
        step: 1,
      },
    ],
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    description: 'Cyberpunk grid lines, futuristic energy',
    style: {
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
    },
    animation: 'neonPulse',
    animationCSS: `
      @keyframes neonPulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
      }
    `,
    controls: [
      {
        id: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        value: '#0a0a0a',
      },
      {
        id: 'neonColor',
        label: 'Neon Color',
        type: 'color',
        value: '#00ffff',
      },
      {
        id: 'gridSize',
        label: 'Grid Size',
        type: 'range',
        value: 50,
        min: 20,
        max: 100,
        step: 10,
      },
      {
        id: 'pulseSpeed',
        label: 'Pulse Speed',
        type: 'range',
        value: 2,
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },
  {
    id: 'rainbow-shift',
    name: 'Rainbow Shift',
    description: 'Smooth color transitions, vibrant spectrum',
    style: {
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
      backgroundSize: '300% 300%',
    },
    animation: 'rainbowShift',
    animationCSS: `
      @keyframes rainbowShift {
        0% { background-position: 0% 50%; }
        25% { background-position: 100% 50%; }
        50% { background-position: 100% 100%; }
        75% { background-position: 0% 100%; }
        100% { background-position: 0% 50%; }
      }
    `,
    controls: [
      {
        id: 'color1',
        label: 'Color 1 (Red)',
        type: 'color',
        value: '#ff6b6b',
      },
      {
        id: 'color2',
        label: 'Color 2 (Teal)',
        type: 'color',
        value: '#4ecdc4',
      },
      {
        id: 'color3',
        label: 'Color 3 (Blue)',
        type: 'color',
        value: '#45b7d1',
      },
      {
        id: 'color4',
        label: 'Color 4 (Green)',
        type: 'color',
        value: '#96ceb4',
      },
      {
        id: 'color5',
        label: 'Color 5 (Yellow)',
        type: 'color',
        value: '#ffeaa7',
      },
      {
        id: 'color6',
        label: 'Color 6 (Pink)',
        type: 'color',
        value: '#fd79a8',
      },
      {
        id: 'speed',
        label: 'Shift Speed',
        type: 'range',
        value: 12,
        min: 6,
        max: 20,
        step: 2,
      },
    ],
  },
  {
    id: 'matrix-rain',
    name: 'Matrix Rain',
    description: 'Digital rain effect, sci-fi atmosphere',
    style: {
      backgroundColor: '#000000',
      backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent)`,
      backgroundSize: '20px 20px',
    },
    animation: 'matrixFall',
    animationCSS: `
      @keyframes matrixFall {
        0% { background-position: 0 0; }
        100% { background-position: 0 20px; }
      }
    `,
    controls: [
      {
        id: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        value: '#000000',
      },
      {
        id: 'matrixColor',
        label: 'Matrix Color',
        type: 'color',
        value: '#00ff00',
      },
      {
        id: 'rainSpeed',
        label: 'Rain Speed',
        type: 'range',
        value: 1,
        min: 0.5,
        max: 3,
        step: 0.5,
      },
    ],
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Flowing water ripples, calming blue motion',
    style: {
      background: 'linear-gradient(180deg, #74b9ff 0%, #0984e3 50%, #2d3436 100%)',
    },
    animation: 'oceanFlow',
    animationCSS: `
      @keyframes oceanFlow {
        0%, 100% { transform: translateX(0) scaleY(1); }
        25% { transform: translateX(-10px) scaleY(1.05); }
        50% { transform: translateX(0) scaleY(0.95); }
        75% { transform: translateX(10px) scaleY(1.05); }
      }
    `,
    controls: [
      {
        id: 'surfaceColor',
        label: 'Surface Color',
        type: 'color',
        value: '#74b9ff',
      },
      {
        id: 'middleColor',
        label: 'Middle Color',
        type: 'color',
        value: '#0984e3',
      },
      {
        id: 'deepColor',
        label: 'Deep Color',
        type: 'color',
        value: '#2d3436',
      },
      {
        id: 'waveSpeed',
        label: 'Wave Speed',
        type: 'range',
        value: 6,
        min: 3,
        max: 12,
        step: 1,
      },
    ],
  },
  {
    id: 'electric-storm',
    name: 'Electric Storm',
    description: 'Lightning energy pulses, dynamic electric field',
    style: {
      background: 'radial-gradient(ellipse at center, #2d1b69 0%, #11052c 100%)',
    },
    animation: 'electricPulse',
    animationCSS: `
      @keyframes electricPulse {
        0%, 100% { 
          box-shadow: inset 0 0 50px rgba(138, 43, 226, 0.1);
          filter: brightness(1);
        }
        10% { 
          box-shadow: inset 0 0 100px rgba(138, 43, 226, 0.3);
          filter: brightness(1.2);
        }
        20% { 
          box-shadow: inset 0 0 50px rgba(138, 43, 226, 0.1);
          filter: brightness(1);
        }
        50% { 
          box-shadow: inset 0 0 80px rgba(138, 43, 226, 0.2);
          filter: brightness(1.1);
        }
      }
    `,
    controls: [
      {
        id: 'stormColor1',
        label: 'Storm Color 1',
        type: 'color',
        value: '#2d1b69',
      },
      {
        id: 'stormColor2',
        label: 'Storm Color 2',
        type: 'color',
        value: '#11052c',
      },
      {
        id: 'electricColor',
        label: 'Electric Color',
        type: 'color',
        value: '#8a2be2',
      },
      {
        id: 'intensity',
        label: 'Storm Intensity',
        type: 'range',
        value: 0.3,
        min: 0.1,
        max: 0.6,
        step: 0.1,
      },
      {
        id: 'speed',
        label: 'Lightning Speed',
        type: 'range',
        value: 4,
        min: 2,
        max: 8,
        step: 1,
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
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.warmth !== undefined) {
        const warmth = controlValues.warmth as number
        const baseColor = controlValues.baseColor as string || '#fefefe'
        const r = parseInt(baseColor.slice(1, 3), 16) + warmth
        const g = parseInt(baseColor.slice(3, 5), 16) + Math.floor(warmth * 0.7)
        const b = parseInt(baseColor.slice(5, 7), 16) - warmth
        style.backgroundColor = `rgb(${Math.min(255, Math.max(240, r))}, ${Math.min(255, Math.max(240, g))}, ${Math.min(255, Math.max(240, b))})`
      }
      break
      
    case 'diagonal-stripes':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.stripeColor || controlValues.thickness) {
        const width = (controlValues.thickness || 10) as number
        const stripeColor = (controlValues.stripeColor || '#000000') as string
        const stripeRgba = hexToRgba(stripeColor, 0.01)
        style.backgroundImage = `repeating-linear-gradient(
          45deg,
          transparent,
          transparent ${width}px,
          ${stripeRgba} ${width}px,
          ${stripeRgba} ${width * 2}px
        )`
      }
      break
      
    case 'micro-dots':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.dotColor || controlValues.dotSize) {
        const dotColor = (controlValues.dotColor || '#000000') as string
        const dotSize = (controlValues.dotSize || 20) as number
        const dotRgba = hexToRgba(dotColor, 0.03)
        style.backgroundImage = `radial-gradient(circle, ${dotRgba} 1px, transparent 1px)`
        style.backgroundSize = `${dotSize}px ${dotSize}px`
      }
      break
      
    case 'living-gradient':
      if (controlValues.color1 || controlValues.color2 || controlValues.color3 || controlValues.color4) {
        const c1 = (controlValues.color1 || '#ee7752') as string
        const c2 = (controlValues.color2 || '#e73c7e') as string
        const c3 = (controlValues.color3 || '#23a6d5') as string
        const c4 = (controlValues.color4 || '#23d5ab') as string
        style.background = `linear-gradient(270deg, ${c1}, ${c2}, ${c3}, ${c4})`
      }
      break
      
    case 'liquid-waves':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.waveColor) {
        const waveColor = (controlValues.waveColor || '#9C92AC') as string
        const encodedColor = encodeURIComponent(waveColor)
        style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23${encodedColor.slice(1)}' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }
      break
      
    case 'fireflies':
      if (controlValues.color1 || controlValues.color2 || controlValues.color3) {
        const c1 = (controlValues.color1 || '#0f0c29') as string
        const c2 = (controlValues.color2 || '#302b63') as string
        const c3 = (controlValues.color3 || '#24243e') as string
        style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
      }
      break
      
    case 'aurora-veil':
      if (controlValues.baseColor1 || controlValues.baseColor2 || 
          controlValues.auroraColor1 || controlValues.auroraColor2 || 
          controlValues.auroraColor3 || controlValues.auroraColor4 || 
          controlValues.intensity !== undefined) {
        const base1 = (controlValues.baseColor1 || '#fafbfc') as string
        const base2 = (controlValues.baseColor2 || '#e9ecef') as string
        const aurora1 = (controlValues.auroraColor1 || '#7877C6') as string
        const aurora2 = (controlValues.auroraColor2 || '#FF77C6') as string
        const aurora3 = (controlValues.auroraColor3 || '#FFCE54') as string
        const aurora4 = (controlValues.auroraColor4 || '#78DBFF') as string
        const intensity = (controlValues.intensity || 0.3) as number
        
        style.background = `
          radial-gradient(ellipse at top left, ${hexToRgba(aurora1, intensity)} 0%, transparent 50%),
          radial-gradient(ellipse at top right, ${hexToRgba(aurora2, intensity)} 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, ${hexToRgba(aurora3, intensity)} 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, ${hexToRgba(aurora4, intensity)} 0%, transparent 50%),
          linear-gradient(180deg, ${base1} 0%, ${base2} 100%)
        `
      }
      break
      
    case 'floating-orbs':
      if (controlValues.primaryColor || controlValues.secondaryColor) {
        const primary = (controlValues.primaryColor || '#667eea') as string
        const secondary = (controlValues.secondaryColor || '#764ba2') as string
        style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
      }
      break
      
    case 'pulse-waves':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.waveColor || controlValues.intensity) {
        const waveColor = (controlValues.waveColor || '#4facfe') as string
        const intensity = (controlValues.intensity || 0.2) as number
        style.backgroundImage = `radial-gradient(circle at 50% 50%, ${hexToRgba(waveColor, intensity)} 0%, transparent 50%)`
      }
      break
      
    case 'cosmic-dust':
      if (controlValues.spaceColor1 || controlValues.spaceColor2) {
        const space1 = (controlValues.spaceColor1 || '#0f0f23') as string
        const space2 = (controlValues.spaceColor2 || '#000000') as string
        style.background = `radial-gradient(ellipse at center, ${space1} 0%, ${space2} 100%)`
      }
      break
      
    case 'neon-grid':
      if (controlValues.backgroundColor) {
        style.backgroundColor = controlValues.backgroundColor as string
      }
      if (controlValues.neonColor || controlValues.gridSize) {
        const neonColor = (controlValues.neonColor || '#00ffff') as string
        const gridSize = (controlValues.gridSize || 50) as number
        const neonRgba = hexToRgba(neonColor, 0.1)
        style.backgroundImage = `
          linear-gradient(${neonRgba} 1px, transparent 1px),
          linear-gradient(90deg, ${neonRgba} 1px, transparent 1px)
        `
        style.backgroundSize = `${gridSize}px ${gridSize}px`
      }
      break
      
    case 'rainbow-shift':
      if (controlValues.color1 || controlValues.color2 || controlValues.color3 || 
          controlValues.color4 || controlValues.color5 || controlValues.color6) {
        const c1 = (controlValues.color1 || '#ff6b6b') as string
        const c2 = (controlValues.color2 || '#4ecdc4') as string
        const c3 = (controlValues.color3 || '#45b7d1') as string
        const c4 = (controlValues.color4 || '#96ceb4') as string
        const c5 = (controlValues.color5 || '#ffeaa7') as string
        const c6 = (controlValues.color6 || '#fd79a8') as string
        style.background = `linear-gradient(45deg, ${c1}, ${c2}, ${c3}, ${c4}, ${c5}, ${c6})`
      }
      break
      
    case 'matrix-rain':
      if (controlValues.backgroundColor) {
        style.backgroundColor = controlValues.backgroundColor as string
      }
      if (controlValues.matrixColor) {
        const matrixColor = (controlValues.matrixColor || '#00ff00') as string
        const matrixRgba = hexToRgba(matrixColor, 0.05)
        style.backgroundImage = `linear-gradient(0deg, transparent 24%, ${matrixRgba} 25%, ${matrixRgba} 26%, transparent 27%, transparent 74%, ${matrixRgba} 75%, ${matrixRgba} 76%, transparent 77%, transparent)`
      }
      break
      
    case 'ocean-waves':
      if (controlValues.surfaceColor || controlValues.middleColor || controlValues.deepColor) {
        const surface = (controlValues.surfaceColor || '#74b9ff') as string
        const middle = (controlValues.middleColor || '#0984e3') as string
        const deep = (controlValues.deepColor || '#2d3436') as string
        style.background = `linear-gradient(180deg, ${surface} 0%, ${middle} 50%, ${deep} 100%)`
      }
      break
      
    case 'electric-storm':
      if (controlValues.stormColor1 || controlValues.stormColor2) {
        const storm1 = (controlValues.stormColor1 || '#2d1b69') as string
        const storm2 = (controlValues.stormColor2 || '#11052c') as string
        style.background = `radial-gradient(ellipse at center, ${storm1} 0%, ${storm2} 100%)`
      }
      if (controlValues.electricColor || controlValues.intensity) {
        const electricColor = (controlValues.electricColor || '#8a2be2') as string
        const intensity = (controlValues.intensity || 0.3) as number
        const electricRgba = hexToRgba(electricColor, intensity)
        style.boxShadow = `inset 0 0 50px ${electricRgba}`
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