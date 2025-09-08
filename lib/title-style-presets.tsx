import React from 'react'

export interface TitleStylePreset {
  id: string
  name: string
  description: string
  styles: {
    // Title styles
    titleFontFamily: string
    titleFontSize: string
    titleFontSizeMobile: string
    titleFontWeight: string
    titleColor: string
    titleLineHeight: string
    titleLetterSpacing: string
    titleTextTransform?: string
    titleTextShadow?: string
    
    // Description styles
    descriptionFontFamily: string
    descriptionFontSize: string
    descriptionFontSizeMobile: string
    descriptionFontWeight: string
    descriptionColor: string
    descriptionLineHeight: string
    descriptionLetterSpacing: string
    descriptionMaxWidth?: string
    
    // Layout
    textAlign: 'left' | 'center' | 'right'
    titleMarginBottom: string
    descriptionMarginTop: string
    containerPadding: string
    containerPaddingMobile: string
    
    // Decorative elements
    accentElement?: 'underline' | 'highlight' | 'bracket' | 'dot' | 'none'
    accentColor?: string
    backgroundTreatment?: 'none' | 'subtle-gradient' | 'blur-card' | 'shadow-box'
  }
  preview?: {
    googleFonts?: string[]
  }
}

export const titleStylePresets: TitleStylePreset[] = [
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Simple, elegant typography with lots of white space',
    styles: {
      titleFontFamily: 'Inter, -apple-system, sans-serif',
      titleFontSize: '3.5rem',
      titleFontSizeMobile: '2.25rem',
      titleFontWeight: '600',
      titleColor: '#111827',
      titleLineHeight: '1.1',
      titleLetterSpacing: '-0.02em',
      
      descriptionFontFamily: 'Inter, -apple-system, sans-serif',
      descriptionFontSize: '1.125rem',
      descriptionFontSizeMobile: '1rem',
      descriptionFontWeight: '400',
      descriptionColor: '#6b7280',
      descriptionLineHeight: '1.6',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '42rem',
      
      textAlign: 'center',
      titleMarginBottom: '1.5rem',
      descriptionMarginTop: '1rem',
      containerPadding: '4rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'none',
      backgroundTreatment: 'none'
    },
    preview: {
      googleFonts: ['Inter:400,600']
    }
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    description: 'Strong, attention-grabbing headlines with contrast',
    styles: {
      titleFontFamily: 'Montserrat, sans-serif',
      titleFontSize: '4.5rem',
      titleFontSizeMobile: '2.75rem',
      titleFontWeight: '900',
      titleColor: '#000000',
      titleLineHeight: '0.95',
      titleLetterSpacing: '-0.04em',
      titleTextTransform: 'uppercase',
      
      descriptionFontFamily: 'Inter, sans-serif',
      descriptionFontSize: '1.25rem',
      descriptionFontSizeMobile: '1.125rem',
      descriptionFontWeight: '300',
      descriptionColor: '#4b5563',
      descriptionLineHeight: '1.7',
      descriptionLetterSpacing: '0.01em',
      descriptionMaxWidth: '36rem',
      
      textAlign: 'center',
      titleMarginBottom: '2rem',
      descriptionMarginTop: '1.25rem',
      containerPadding: '5rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'underline',
      accentColor: '#ef4444',
      backgroundTreatment: 'none'
    },
    preview: {
      googleFonts: ['Montserrat:300,900', 'Inter:300']
    }
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Subtle color transitions in text, contemporary feel',
    styles: {
      titleFontFamily: 'Poppins, sans-serif',
      titleFontSize: '3.75rem',
      titleFontSizeMobile: '2.5rem',
      titleFontWeight: '700',
      titleColor: 'transparent',
      titleLineHeight: '1.15',
      titleLetterSpacing: '-0.01em',
      titleTextShadow: 'none',
      
      descriptionFontFamily: 'Poppins, sans-serif',
      descriptionFontSize: '1.125rem',
      descriptionFontSizeMobile: '1rem',
      descriptionFontWeight: '400',
      descriptionColor: '#6b7280',
      descriptionLineHeight: '1.65',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '40rem',
      
      textAlign: 'center',
      titleMarginBottom: '1.75rem',
      descriptionMarginTop: '1rem',
      containerPadding: '4rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'highlight',
      accentColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundTreatment: 'subtle-gradient'
    },
    preview: {
      googleFonts: ['Poppins:400,700']
    }
  },
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    description: 'Traditional, trustworthy, editorial-style fonts',
    styles: {
      titleFontFamily: 'Playfair Display, serif',
      titleFontSize: '4rem',
      titleFontSizeMobile: '2.5rem',
      titleFontWeight: '700',
      titleColor: '#1f2937',
      titleLineHeight: '1.2',
      titleLetterSpacing: '-0.01em',
      
      descriptionFontFamily: 'Crimson Text, serif',
      descriptionFontSize: '1.25rem',
      descriptionFontSizeMobile: '1.125rem',
      descriptionFontWeight: '400',
      descriptionColor: '#4b5563',
      descriptionLineHeight: '1.75',
      descriptionLetterSpacing: '0.01em',
      descriptionMaxWidth: '44rem',
      
      textAlign: 'center',
      titleMarginBottom: '2rem',
      descriptionMarginTop: '1.25rem',
      containerPadding: '4.5rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'dot',
      accentColor: '#d97706',
      backgroundTreatment: 'none'
    },
    preview: {
      googleFonts: ['Playfair Display:700', 'Crimson Text:400']
    }
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Clean sans-serif, modern spacing, professional',
    styles: {
      titleFontFamily: 'Outfit, sans-serif',
      titleFontSize: '3.5rem',
      titleFontSizeMobile: '2.25rem',
      titleFontWeight: '600',
      titleColor: '#0f172a',
      titleLineHeight: '1.1',
      titleLetterSpacing: '-0.025em',
      
      descriptionFontFamily: 'Inter, sans-serif',
      descriptionFontSize: '1.125rem',
      descriptionFontSizeMobile: '1rem',
      descriptionFontWeight: '400',
      descriptionColor: '#64748b',
      descriptionLineHeight: '1.6',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '38rem',
      
      textAlign: 'left',
      titleMarginBottom: '1.5rem',
      descriptionMarginTop: '1rem',
      containerPadding: '4rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'bracket',
      accentColor: '#3b82f6',
      backgroundTreatment: 'blur-card'
    },
    preview: {
      googleFonts: ['Outfit:600', 'Inter:400']
    }
  },
  {
    id: 'creative-playful',
    name: 'Creative Playful',
    description: 'Fun fonts, colorful accents, personality-driven',
    styles: {
      titleFontFamily: 'Fredoka, sans-serif',
      titleFontSize: '3.75rem',
      titleFontSizeMobile: '2.5rem',
      titleFontWeight: '600',
      titleColor: '#7c3aed',
      titleLineHeight: '1.2',
      titleLetterSpacing: '-0.01em',
      
      descriptionFontFamily: 'Quicksand, sans-serif',
      descriptionFontSize: '1.25rem',
      descriptionFontSizeMobile: '1.125rem',
      descriptionFontWeight: '500',
      descriptionColor: '#6b7280',
      descriptionLineHeight: '1.65',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '40rem',
      
      textAlign: 'center',
      titleMarginBottom: '1.75rem',
      descriptionMarginTop: '1rem',
      containerPadding: '4rem 2rem',
      containerPaddingMobile: '3rem 1.5rem',
      
      accentElement: 'highlight',
      accentColor: '#fbbf24',
      backgroundTreatment: 'none'
    },
    preview: {
      googleFonts: ['Fredoka:600', 'Quicksand:500']
    }
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    description: 'Sophisticated typography, gold accents, high-end feel',
    styles: {
      titleFontFamily: 'Cormorant Garamond, serif',
      titleFontSize: '4.5rem',
      titleFontSizeMobile: '2.75rem',
      titleFontWeight: '300',
      titleColor: '#0f172a',
      titleLineHeight: '1.1',
      titleLetterSpacing: '0.02em',
      titleTextTransform: 'uppercase',
      
      descriptionFontFamily: 'Lato, sans-serif',
      descriptionFontSize: '1.125rem',
      descriptionFontSizeMobile: '1rem',
      descriptionFontWeight: '300',
      descriptionColor: '#64748b',
      descriptionLineHeight: '1.8',
      descriptionLetterSpacing: '0.05em',
      descriptionMaxWidth: '36rem',
      
      textAlign: 'center',
      titleMarginBottom: '2.5rem',
      descriptionMarginTop: '1.5rem',
      containerPadding: '5rem 2rem',
      containerPaddingMobile: '3.5rem 1.5rem',
      
      accentElement: 'underline',
      accentColor: '#d4af37',
      backgroundTreatment: 'shadow-box'
    },
    preview: {
      googleFonts: ['Cormorant Garamond:300', 'Lato:300']
    }
  },
  {
    id: 'newsletter-style',
    name: 'Newsletter Style',
    description: 'Email-friendly, readable, conversion-focused',
    styles: {
      titleFontFamily: 'Merriweather, serif',
      titleFontSize: '2.75rem',
      titleFontSizeMobile: '2rem',
      titleFontWeight: '700',
      titleColor: '#111827',
      titleLineHeight: '1.3',
      titleLetterSpacing: '-0.01em',
      
      descriptionFontFamily: 'Open Sans, sans-serif',
      descriptionFontSize: '1.125rem',
      descriptionFontSizeMobile: '1rem',
      descriptionFontWeight: '400',
      descriptionColor: '#374151',
      descriptionLineHeight: '1.7',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '32rem',
      
      textAlign: 'left',
      titleMarginBottom: '1.25rem',
      descriptionMarginTop: '0.75rem',
      containerPadding: '3rem 2rem',
      containerPaddingMobile: '2.5rem 1.5rem',
      
      accentElement: 'none',
      backgroundTreatment: 'blur-card'
    },
    preview: {
      googleFonts: ['Merriweather:700', 'Open Sans:400']
    }
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Instagram-ready, shareable, trendy typography',
    styles: {
      titleFontFamily: 'Bebas Neue, sans-serif',
      titleFontSize: '5rem',
      titleFontSizeMobile: '3rem',
      titleFontWeight: '400',
      titleColor: '#000000',
      titleLineHeight: '0.9',
      titleLetterSpacing: '0.05em',
      titleTextTransform: 'uppercase',
      
      descriptionFontFamily: 'DM Sans, sans-serif',
      descriptionFontSize: '1rem',
      descriptionFontSizeMobile: '0.875rem',
      descriptionFontWeight: '400',
      descriptionColor: '#6b7280',
      descriptionLineHeight: '1.5',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '30rem',
      
      textAlign: 'center',
      titleMarginBottom: '1.5rem',
      descriptionMarginTop: '0.75rem',
      containerPadding: '4rem 1.5rem',
      containerPaddingMobile: '3rem 1rem',
      
      accentElement: 'highlight',
      accentColor: '#ec4899',
      backgroundTreatment: 'subtle-gradient'
    },
    preview: {
      googleFonts: ['Bebas Neue:400', 'DM Sans:400']
    }
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Formal',
    description: 'Business-appropriate, conservative, reliable',
    styles: {
      titleFontFamily: 'Roboto, sans-serif',
      titleFontSize: '3rem',
      titleFontSizeMobile: '2rem',
      titleFontWeight: '500',
      titleColor: '#1e293b',
      titleLineHeight: '1.2',
      titleLetterSpacing: '-0.01em',
      
      descriptionFontFamily: 'Roboto, sans-serif',
      descriptionFontSize: '1rem',
      descriptionFontSizeMobile: '0.875rem',
      descriptionFontWeight: '400',
      descriptionColor: '#475569',
      descriptionLineHeight: '1.6',
      descriptionLetterSpacing: '0',
      descriptionMaxWidth: '40rem',
      
      textAlign: 'left',
      titleMarginBottom: '1.25rem',
      descriptionMarginTop: '0.75rem',
      containerPadding: '3.5rem 2rem',
      containerPaddingMobile: '2.5rem 1.5rem',
      
      accentElement: 'none',
      backgroundTreatment: 'none'
    },
    preview: {
      googleFonts: ['Roboto:400,500']
    }
  }
]

export function applyTitleStylePreset(preset: TitleStylePreset): React.CSSProperties {
  const styles = preset.styles
  
  return {
    // Container styles
    padding: styles.containerPadding,
    textAlign: styles.textAlign,
    
    // Title specific styles are applied separately
    // This returns container-level styles
  }
}

export function getTitleStyles(preset: TitleStylePreset): React.CSSProperties {
  const styles = preset.styles
  const baseStyles: React.CSSProperties = {
    fontFamily: styles.titleFontFamily,
    fontSize: styles.titleFontSize,
    fontWeight: styles.titleFontWeight as any,
    color: styles.titleColor,
    lineHeight: styles.titleLineHeight,
    letterSpacing: styles.titleLetterSpacing,
    marginBottom: styles.titleMarginBottom,
    textTransform: styles.titleTextTransform as any,
    textShadow: styles.titleTextShadow,
  }
  
  // Handle gradient text
  if (styles.accentColor?.includes('gradient') && preset.id === 'modern-gradient') {
    return {
      ...baseStyles,
      background: styles.accentColor,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }
  }
  
  return baseStyles
}

export function getDescriptionStyles(preset: TitleStylePreset): React.CSSProperties {
  const styles = preset.styles
  return {
    fontFamily: styles.descriptionFontFamily,
    fontSize: styles.descriptionFontSize,
    fontWeight: styles.descriptionFontWeight as any,
    color: styles.descriptionColor,
    lineHeight: styles.descriptionLineHeight,
    letterSpacing: styles.descriptionLetterSpacing,
    marginTop: styles.descriptionMarginTop,
    maxWidth: styles.descriptionMaxWidth,
    marginLeft: styles.textAlign === 'center' ? 'auto' : undefined,
    marginRight: styles.textAlign === 'center' ? 'auto' : undefined,
  }
}

export function getAccentElement(preset: TitleStylePreset): React.ReactNode | null {
  const { accentElement, accentColor } = preset.styles
  
  if (!accentElement || accentElement === 'none') return null
  
  switch (accentElement) {
    case 'underline':
      return (
        <div 
          style={{
            height: '3px',
            width: '60px',
            background: accentColor,
            margin: preset.styles.textAlign === 'center' ? '1rem auto' : '1rem 0',
            borderRadius: '2px',
          }}
        />
      )
    case 'highlight':
      return null // Handled in text styles
    case 'bracket':
      return (
        <div 
          style={{
            width: '4px',
            height: '40px',
            background: accentColor,
            position: 'absolute',
            left: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '2px',
          }}
        />
      )
    case 'dot':
      return (
        <div 
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: preset.styles.textAlign === 'center' ? 'center' : 'flex-start',
            margin: '1rem 0',
          }}
        >
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: accentColor,
                opacity: 1 - (i - 1) * 0.3,
              }}
            />
          ))}
        </div>
      )
    default:
      return null
  }
}