export interface BackgroundPreset {
  id: string
  name: string
  description: string
  style: React.CSSProperties
  animation?: string
  animationCSS?: string
  controls?: PresetControl[]
  category: 'clean' | 'gradient' | 'animated' | 'dark' | 'neon' | 'nature'
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
  // === CLEAN & MINIMAL THEMES ===
  {
    id: 'pure-white',
    name: 'Pure White',
    description: 'Clean, minimal white background',
    category: 'clean',
    style: {
      background: '#ffffff',
    },
    controls: [
      {
        id: 'color',
        label: 'Background Color',
        type: 'color',
        value: '#ffffff',
      },
    ],
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Gentle gray for subtle elegance',
    category: 'clean',
    style: {
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Top Color',
        type: 'color',
        value: '#f8f9fa',
      },
      {
        id: 'color2',
        label: 'Bottom Color',
        type: 'color',
        value: '#e9ecef',
      },
    ],
  },
  {
    id: 'warm-beige',
    name: 'Warm Beige',
    description: 'Cozy, warm beige tones',
    category: 'clean',
    style: {
      background: 'linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Light Beige',
        type: 'color',
        value: '#f5f5dc',
      },
      {
        id: 'color2',
        label: 'Warm Beige',
        type: 'color',
        value: '#f0e68c',
      },
    ],
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    description: 'Calm, professional blue tones',
    category: 'clean',
    style: {
      background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Light Blue',
        type: 'color',
        value: '#e3f2fd',
      },
      {
        id: 'color2',
        label: 'Medium Blue',
        type: 'color',
        value: '#bbdefb',
      },
    ],
  },

  // === GRADIENT THEMES ===
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm sunset colors, perfect for personal brands',
    category: 'gradient',
    style: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Sunset Orange',
        type: 'color',
        value: '#ff9a9e',
      },
      {
        id: 'color2',
        label: 'Sunset Pink',
        type: 'color',
        value: '#fecfef',
      },
    ],
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    description: 'Deep ocean blues, calming and professional',
    category: 'gradient',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Ocean Blue',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'color2',
        label: 'Deep Purple',
        type: 'color',
        value: '#764ba2',
      },
    ],
  },
  {
    id: 'forest-gradient',
    name: 'Forest Gradient',
    description: 'Natural greens, earthy and organic',
    category: 'gradient',
    style: {
      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Forest Green',
        type: 'color',
        value: '#56ab2f',
      },
      {
        id: 'color2',
        label: 'Light Green',
        type: 'color',
        value: '#a8e6cf',
      },
    ],
  },
  {
    id: 'lavender-gradient',
    name: 'Lavender Gradient',
    description: 'Soft purple tones, elegant and feminine',
    category: 'gradient',
    style: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    controls: [
      {
        id: 'color1',
        label: 'Mint Green',
        type: 'color',
        value: '#a8edea',
      },
      {
        id: 'color2',
        label: 'Soft Pink',
        type: 'color',
        value: '#fed6e3',
      },
    ],
  },

  // === ANIMATED THEMES ===
  {
    id: 'floating-particles',
    name: 'Floating Particles',
    description: 'Gentle floating particles, dreamy atmosphere',
    category: 'animated',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    animation: 'particleFloat',
    animationCSS: `
      @keyframes particleFloat {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg); 
          opacity: 0.7;
        }
        50% { 
          transform: translateY(-20px) rotate(180deg); 
          opacity: 1;
        }
      }
    `,
    controls: [
      {
        id: 'color1',
        label: 'Background Color 1',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'color2',
        label: 'Background Color 2',
        type: 'color',
        value: '#764ba2',
      },
      {
        id: 'particleColor',
        label: 'Particle Color',
        type: 'color',
        value: '#ffffff',
      },
      {
        id: 'speed',
        label: 'Animation Speed',
        type: 'range',
        value: 8,
        min: 4,
        max: 16,
        step: 2,
      },
    ],
  },
  {
    id: 'breathing-glow',
    name: 'Breathing Glow',
    description: 'Soft pulsing glow, meditative and calming',
    category: 'animated',
    style: {
      background: 'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
      backgroundColor: '#fafbfc',
    },
    animation: 'breathingGlow',
    animationCSS: `
      @keyframes breathingGlow {
        0%, 100% { 
          transform: scale(1); 
          opacity: 0.1;
        }
        50% { 
          transform: scale(1.1); 
          opacity: 0.3;
        }
      }
    `,
    controls: [
      {
        id: 'baseColor',
        label: 'Base Color',
        type: 'color',
        value: '#fafbfc',
      },
      {
        id: 'glowColor',
        label: 'Glow Color',
        type: 'color',
        value: '#667eea',
      },
      {
        id: 'intensity',
        label: 'Glow Intensity',
        type: 'range',
        value: 0.1,
        min: 0.05,
        max: 0.3,
        step: 0.05,
      },
      {
        id: 'speed',
        label: 'Breathing Speed',
        type: 'range',
        value: 4,
        min: 2,
        max: 8,
        step: 1,
      },
    ],
  },
  {
    id: 'gentle-waves',
    name: 'Gentle Waves',
    description: 'Soft flowing waves, peaceful and serene',
    category: 'animated',
    style: {
      backgroundColor: '#f0f4f8',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%239C92AC' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    },
    animation: 'waveFlow',
    animationCSS: `
      @keyframes waveFlow {
        0% { 
          background-position-x: 0;
        }
        100% { 
          background-position-x: 100px;
        }
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

  // === DARK & CYBER THEMES ===
  {
    id: 'dark-matrix',
    name: 'Dark Matrix',
    description: 'Cyberpunk matrix effect, futuristic and edgy',
    category: 'dark',
    style: {
      backgroundColor: '#000000',
      backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent)`,
      backgroundSize: '20px 20px',
    },
    animation: 'matrixFall',
    animationCSS: `
      @keyframes matrixFall {
        0% { 
          background-position: 0 0;
        }
        100% { 
          background-position: 0 20px;
        }
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
    id: 'cyber-grid',
    name: 'Cyber Grid',
    description: 'Futuristic grid lines, tech-inspired design',
    category: 'dark',
    style: {
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
    },
    animation: 'gridWarp',
    animationCSS: `
      @keyframes gridWarp {
        0% { 
          background-position: 0 0;
          transform: skew(0deg, 0deg);
        }
        12.5% { 
          background-position: 18px 7px;
          transform: skew(0.5deg, 0.5deg);
        }
        25% { 
          background-position: 35px 18px;
          transform: skew(1deg, 1deg);
        }
        37.5% { 
          background-position: 50px 25px;
          transform: skew(1.5deg, 1.5deg);
        }
        50% { 
          background-position: 50px 0;
          transform: skew(0deg, 2deg);
        }
        62.5% { 
          background-position: 35px -18px;
          transform: skew(-1.5deg, 1.5deg);
        }
        75% { 
          background-position: 18px -25px;
          transform: skew(-1deg, 1deg);
        }
        87.5% { 
          background-position: 7px -18px;
          transform: skew(-0.5deg, 0.5deg);
        }
        100% { 
          background-position: 0 0;
          transform: skew(0deg, 0deg);
        }
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
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Cosmic space with twinkling stars',
    category: 'dark',
    style: {
      background: 'radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%)',
    },
    animation: 'starTwinkle',
    animationCSS: `
      @keyframes starTwinkle {
        0%, 100% { 
          opacity: 0.3; 
          transform: scale(0.8) rotate(0deg);
        }
        50% { 
          opacity: 1; 
          transform: scale(1.2) rotate(180deg);
        }
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
        id: 'starColor',
        label: 'Star Color',
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

  // === NEON & ELECTRIC THEMES ===
  {
    id: 'electric-storm',
    name: 'Electric Storm',
    description: 'Lightning energy pulses, dynamic electric field',
    category: 'neon',
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
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Vibrant neon colors with pulsing glow',
    category: 'neon',
    style: {
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
      backgroundSize: '300% 300%',
    },
    animation: 'neonShift',
    animationCSS: `
      @keyframes neonShift {
        0% { 
          background-position: 0% 50%;
        }
        25% { 
          background-position: 100% 50%;
        }
        50% { 
          background-position: 100% 100%;
        }
        75% { 
          background-position: 0% 100%;
        }
        100% { 
          background-position: 0% 50%;
        }
      }
    `,
    controls: [
      {
        id: 'color1',
        label: 'Neon Red',
        type: 'color',
        value: '#ff6b6b',
      },
      {
        id: 'color2',
        label: 'Neon Teal',
        type: 'color',
        value: '#4ecdc4',
      },
      {
        id: 'color3',
        label: 'Neon Blue',
        type: 'color',
        value: '#45b7d1',
      },
      {
        id: 'color4',
        label: 'Neon Green',
        type: 'color',
        value: '#96ceb4',
      },
      {
        id: 'color5',
        label: 'Neon Yellow',
        type: 'color',
        value: '#ffeaa7',
      },
      {
        id: 'color6',
        label: 'Neon Pink',
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

  // === NATURE & OCEAN THEMES ===
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep ocean blues with flowing water motion',
    category: 'nature',
    style: {
      background: 'linear-gradient(180deg, #74b9ff 0%, #0984e3 50%, #2d3436 100%)',
    },
    animation: 'oceanFlow',
    animationCSS: `
      @keyframes oceanFlow {
        0%, 100% { 
          transform: translateX(0) scaleY(1);
        }
        25% { 
          transform: translateX(-10px) scaleY(1.05);
        }
        50% { 
          transform: translateX(0) scaleY(0.95);
        }
        75% { 
          transform: translateX(10px) scaleY(1.05);
        }
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
    id: 'forest-mist',
    name: 'Forest Mist',
    description: 'Mystical forest with gentle mist movement',
    category: 'nature',
    style: {
      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    },
    animation: 'mistFlow',
    animationCSS: `
      @keyframes mistFlow {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg); 
          opacity: 0.8;
        }
        50% { 
          transform: translateY(-15px) rotate(2deg); 
          opacity: 1;
        }
      }
    `,
    controls: [
      {
        id: 'forestColor1',
        label: 'Forest Green',
        type: 'color',
        value: '#56ab2f',
      },
      {
        id: 'forestColor2',
        label: 'Light Green',
        type: 'color',
        value: '#a8e6cf',
      },
      {
        id: 'mistColor',
        label: 'Mist Color',
        type: 'color',
        value: '#ffffff',
      },
      {
        id: 'mistSpeed',
        label: 'Mist Speed',
        type: 'range',
        value: 8,
        min: 4,
        max: 16,
        step: 2,
      },
    ],
  },
  {
    id: 'sunset-sky',
    name: 'Sunset Sky',
    description: 'Beautiful sunset with warm, inviting colors',
    category: 'nature',
    style: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    },
    animation: 'sunsetGlow',
    animationCSS: `
      @keyframes sunsetGlow {
        0%, 100% { 
          filter: brightness(1) saturate(1);
        }
        50% { 
          filter: brightness(1.1) saturate(1.2);
        }
      }
    `,
    controls: [
      {
        id: 'sunsetColor1',
        label: 'Sunset Orange',
        type: 'color',
        value: '#ff9a9e',
      },
      {
        id: 'sunsetColor2',
        label: 'Sunset Pink',
        type: 'color',
        value: '#fecfef',
      },
      {
        id: 'glowIntensity',
        label: 'Glow Intensity',
        type: 'range',
        value: 1.1,
        min: 1.0,
        max: 1.3,
        step: 0.1,
      },
      {
        id: 'glowSpeed',
        label: 'Glow Speed',
        type: 'range',
        value: 6,
        min: 3,
        max: 12,
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
    case 'pure-white':
      if (controlValues.color) {
        style.background = controlValues.color as string
      }
      break
      
    case 'soft-gray':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#f8f9fa') as string
        const c2 = (controlValues.color2 || '#e9ecef') as string
        style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'warm-beige':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#f5f5dc') as string
        const c2 = (controlValues.color2 || '#f0e68c') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'cool-blue':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#e3f2fd') as string
        const c2 = (controlValues.color2 || '#bbdefb') as string
        style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'sunset-gradient':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#ff9a9e') as string
        const c2 = (controlValues.color2 || '#fecfef') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c2} 100%)`
      }
      break
      
    case 'ocean-gradient':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#667eea') as string
        const c2 = (controlValues.color2 || '#764ba2') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'forest-gradient':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#56ab2f') as string
        const c2 = (controlValues.color2 || '#a8e6cf') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'lavender-gradient':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#a8edea') as string
        const c2 = (controlValues.color2 || '#fed6e3') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'floating-particles':
      if (controlValues.color1 || controlValues.color2) {
        const c1 = (controlValues.color1 || '#667eea') as string
        const c2 = (controlValues.color2 || '#764ba2') as string
        style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
      }
      break
      
    case 'breathing-glow':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.glowColor || controlValues.intensity !== undefined) {
        const color = (controlValues.glowColor || '#667eea') as string
        const intensity = (controlValues.intensity || 0.1) as number
        style.background = `radial-gradient(ellipse at center, ${hexToRgba(color, intensity)} 0%, rgba(255, 255, 255, 0) 70%)`
      }
      break
      
    case 'gentle-waves':
      if (controlValues.baseColor) {
        style.backgroundColor = controlValues.baseColor as string
      }
      if (controlValues.waveColor) {
        const waveColor = (controlValues.waveColor || '#9C92AC') as string
        const encodedColor = encodeURIComponent(waveColor)
        style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23${encodedColor.slice(1)}' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }
      break
      
    case 'dark-matrix':
      if (controlValues.backgroundColor) {
        style.backgroundColor = controlValues.backgroundColor as string
      }
      if (controlValues.matrixColor) {
        const matrixColor = (controlValues.matrixColor || '#00ff00') as string
        const matrixRgba = hexToRgba(matrixColor, 0.05)
        style.backgroundImage = `linear-gradient(0deg, transparent 24%, ${matrixRgba} 25%, ${matrixRgba} 26%, transparent 27%, transparent 74%, ${matrixRgba} 75%, ${matrixRgba} 76%, transparent 77%, transparent)`
      }
      break
      
    case 'cyber-grid':
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
      
    case 'deep-space':
      if (controlValues.spaceColor1 || controlValues.spaceColor2) {
        const space1 = (controlValues.spaceColor1 || '#0f0f23') as string
        const space2 = (controlValues.spaceColor2 || '#000000') as string
        style.background = `radial-gradient(ellipse at center, ${space1} 0%, ${space2} 100%)`
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
      
    case 'neon-glow':
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
      
    case 'ocean-depths':
      if (controlValues.surfaceColor || controlValues.middleColor || controlValues.deepColor) {
        const surface = (controlValues.surfaceColor || '#74b9ff') as string
        const middle = (controlValues.middleColor || '#0984e3') as string
        const deep = (controlValues.deepColor || '#2d3436') as string
        style.background = `linear-gradient(180deg, ${surface} 0%, ${middle} 50%, ${deep} 100%)`
      }
      break
      
    case 'forest-mist':
      if (controlValues.forestColor1 || controlValues.forestColor2) {
        const forest1 = (controlValues.forestColor1 || '#56ab2f') as string
        const forest2 = (controlValues.forestColor2 || '#a8e6cf') as string
        style.background = `linear-gradient(135deg, ${forest1} 0%, ${forest2} 100%)`
      }
      break
      
    case 'sunset-sky':
      if (controlValues.sunsetColor1 || controlValues.sunsetColor2) {
        const sunset1 = (controlValues.sunsetColor1 || '#ff9a9e') as string
        const sunset2 = (controlValues.sunsetColor2 || '#fecfef') as string
        style.background = `linear-gradient(135deg, ${sunset1} 0%, ${sunset2} 50%, ${sunset2} 100%)`
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