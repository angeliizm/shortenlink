export interface ProfilePreset {
  id: string
  name: string
  styles: {
    // Container styles
    containerPadding: string
    containerBorderRadius: string
    containerBackground: string
    containerBorder?: string
    containerShadow: string
    
    // Avatar styles
    avatarSize: string
    avatarBorderRadius: string
    avatarBorder?: string
    avatarShadow: string
    avatarBackground: string
    
    // Title styles
    titleFontSize: string
    titleFontWeight: string
    titleColor: string
    titleMargin: string
    titleLetterSpacing?: string
    
    // Description styles
    descriptionFontSize: string
    descriptionColor: string
    descriptionMargin: string
    descriptionLineHeight: string
    
    // Decorative elements
    showDecorativeElements: boolean
    decorativeColor: string
    decorativeSize: string
  }
}

export const profilePresets: ProfilePreset[] = [
  {
    id: 'cyberpunk-matrix',
    name: 'Cyberpunk Matrix',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '0px',
      containerBackground: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      containerBorder: '2px solid #00ff41',
      containerShadow: '0 0 40px rgba(0, 255, 65, 0.4), inset 0 0 20px rgba(0, 255, 65, 0.1)',
      
      avatarSize: '100px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #00ff41',
      avatarShadow: '0 0 25px rgba(0, 255, 65, 0.6), 0 0 50px rgba(0, 255, 65, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
      
      titleFontSize: '32px',
      titleFontWeight: '900',
      titleColor: '#00ff41',
      titleMargin: '0 0 12px 0',
      titleLetterSpacing: '2px',
      
      descriptionFontSize: '16px',
      descriptionColor: '#00ff88',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#00ff41',
      decorativeSize: '8px'
    }
  },
  {
    id: 'holographic-rainbow',
    name: 'Holographic Rainbow',
    styles: {
      containerPadding: '45px',
      containerBorderRadius: '30px',
      containerBackground: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b)',
      containerBackgroundSize: '300% 300%',
      containerShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(255, 0, 110, 0.4)',
      
      avatarSize: '110px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid rgba(255, 255, 255, 0.9)',
      avatarShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      
      titleFontSize: '36px',
      titleFontWeight: '800',
      titleColor: '#ffffff',
      titleMargin: '0 0 15px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: 'rgba(255, 255, 255, 0.95)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.8)',
      decorativeSize: '12px'
    }
  },
  {
    id: 'neon-purple-dark',
    name: 'Neon Purple Dark',
    styles: {
      containerPadding: '35px',
      containerBorderRadius: '20px',
      containerBackground: 'linear-gradient(135deg, #1a0033 0%, #2d1b69 50%, #1a0033 100%)',
      containerBorder: '1px solid #8b5cf6',
      containerShadow: '0 0 35px rgba(139, 92, 246, 0.5), 0 10px 25px rgba(0, 0, 0, 0.4)',
      
      avatarSize: '90px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #8b5cf6',
      avatarShadow: '0 0 20px rgba(139, 92, 246, 0.7), 0 6px 20px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      
      titleFontSize: '30px',
      titleFontWeight: '700',
      titleColor: '#8b5cf6',
      titleMargin: '0 0 10px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '17px',
      descriptionColor: '#c4b5fd',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#8b5cf6',
      decorativeSize: '10px'
    }
  },
  {
    id: 'glassmorphism-blue',
    name: 'Glassmorphism Blue',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '25px',
      containerBackground: 'rgba(59, 130, 246, 0.1)',
      containerBorder: '1px solid rgba(59, 130, 246, 0.3)',
      containerShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      
      avatarSize: '95px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(59, 130, 246, 0.4)',
      avatarShadow: '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      avatarBackground: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      
      titleFontSize: '32px',
      titleFontWeight: '600',
      titleColor: '#1e40af',
      titleMargin: '0 0 12px 0',
      
      descriptionFontSize: '18px',
      descriptionColor: '#3730a3',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: false,
      decorativeColor: '#3b82f6',
      decorativeSize: '8px'
    }
  },
  {
    id: 'retro-vaporwave',
    name: 'Retro Vaporwave',
    styles: {
      containerPadding: '42px',
      containerBorderRadius: '15px',
      containerBackground: 'linear-gradient(135deg, #ff0080 0%, #ff8c00 50%, #40e0d0 100%)',
      containerShadow: '0 15px 35px rgba(255, 0, 128, 0.3), 0 0 50px rgba(64, 224, 208, 0.2)',
      
      avatarSize: '105px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid #ffffff',
      avatarShadow: '0 0 25px rgba(255, 255, 255, 0.6), 0 8px 25px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #ff0080 0%, #40e0d0 100%)',
      
      titleFontSize: '34px',
      titleFontWeight: '800',
      titleColor: '#ffffff',
      titleMargin: '0 0 14px 0',
      titleLetterSpacing: '2px',
      
      descriptionFontSize: '19px',
      descriptionColor: 'rgba(255, 255, 255, 0.9)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.7)',
      decorativeSize: '14px'
    }
  },
  {
    id: 'minimal-black-white',
    name: 'Minimal Black & White',
    styles: {
      containerPadding: '30px',
      containerBorderRadius: '0px',
      containerBackground: '#ffffff',
      containerBorder: '3px solid #000000',
      containerShadow: '0 0 0 1px #000000, 0 8px 25px rgba(0, 0, 0, 0.15)',
      
      avatarSize: '80px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #000000',
      avatarShadow: '0 0 0 1px #ffffff, 0 4px 15px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
      
      titleFontSize: '28px',
      titleFontWeight: '900',
      titleColor: '#000000',
      titleMargin: '0 0 8px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '16px',
      descriptionColor: '#666666',
      descriptionMargin: '0',
      descriptionLineHeight: '1.5',
      
      showDecorativeElements: false,
      decorativeColor: '#000000',
      decorativeSize: '6px'
    }
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '22px',
      containerBackground: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      containerBorder: '2px solid #ffd700',
      containerShadow: '0 0 30px rgba(255, 215, 0, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)',
      
      avatarSize: '100px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid #ffd700',
      avatarShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 6px 20px rgba(0, 0, 0, 0.4)',
      avatarBackground: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      
      titleFontSize: '32px',
      titleFontWeight: '700',
      titleColor: '#ffd700',
      titleMargin: '0 0 12px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: '#fbbf24',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#ffd700',
      decorativeSize: '11px'
    }
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    styles: {
      containerPadding: '36px',
      containerBorderRadius: '28px',
      containerBackground: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
      containerShadow: '0 12px 30px rgba(6, 78, 59, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      
      avatarSize: '92px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #06b6d4',
      avatarShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      
      titleFontSize: '30px',
      titleFontWeight: '600',
      titleColor: '#06b6d4',
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#67e8f9',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#06b6d4',
      decorativeSize: '9px'
    }
  },
  {
    id: 'fire-orange',
    name: 'Fire Orange',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '24px',
      containerBackground: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f97316 100%)',
      containerShadow: '0 10px 30px rgba(220, 38, 38, 0.4), 0 0 40px rgba(249, 115, 22, 0.3)',
      
      avatarSize: '98px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #ffffff',
      avatarShadow: '0 0 25px rgba(255, 255, 255, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      
      titleFontSize: '33px',
      titleFontWeight: '800',
      titleColor: '#ffffff',
      titleMargin: '0 0 13px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: 'rgba(255, 255, 255, 0.95)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.8)',
      decorativeSize: '12px'
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    styles: {
      containerPadding: '34px',
      containerBorderRadius: '26px',
      containerBackground: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      containerShadow: '0 8px 25px rgba(4, 120, 87, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      
      avatarSize: '88px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #10b981',
      avatarShadow: '0 0 18px rgba(16, 185, 129, 0.5), 0 5px 18px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      
      titleFontSize: '29px',
      titleFontWeight: '600',
      titleColor: '#10b981',
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '16px',
      descriptionColor: '#6ee7b7',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#10b981',
      decorativeSize: '10px'
    }
  },
  {
    id: 'space-galaxy',
    name: 'Space Galaxy',
    styles: {
      containerPadding: '42px',
      containerBorderRadius: '32px',
      containerBackground: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      containerShadow: '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 50px rgba(138, 43, 226, 0.3)',
      
      avatarSize: '108px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid #8a2be2',
      avatarShadow: '0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(138, 43, 226, 0.4)',
      avatarBackground: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 100%)',
      
      titleFontSize: '35px',
      titleFontWeight: '800',
      titleColor: '#8a2be2',
      titleMargin: '0 0 14px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '19px',
      descriptionColor: '#dda0dd',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: '#8a2be2',
      decorativeSize: '12px'
    }
  },
  {
    id: 'neon-pink-cyber',
    name: 'Neon Pink Cyber',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '18px',
      containerBackground: 'linear-gradient(135deg, #1a0033 0%, #2d1b69 100%)',
      containerBorder: '2px solid #ff1493',
      containerShadow: '0 0 40px rgba(255, 20, 147, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)',
      
      avatarSize: '94px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #ff1493',
      avatarShadow: '0 0 25px rgba(255, 20, 147, 0.8), 0 0 50px rgba(255, 20, 147, 0.4)',
      avatarBackground: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
      
      titleFontSize: '31px',
      titleFontWeight: '700',
      titleColor: '#ff1493',
      titleMargin: '0 0 11px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '17px',
      descriptionColor: '#ffb6c1',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#ff1493',
      decorativeSize: '10px'
    }
  },
  {
    id: 'arctic-ice',
    name: 'Arctic Ice',
    styles: {
      containerPadding: '36px',
      containerBorderRadius: '24px',
      containerBackground: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)',
      containerBorder: '2px solid #00bcd4',
      containerShadow: '0 8px 25px rgba(0, 188, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      
      avatarSize: '90px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #00bcd4',
      avatarShadow: '0 0 20px rgba(0, 188, 212, 0.5), 0 6px 20px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
      
      titleFontSize: '30px',
      titleFontWeight: '600',
      titleColor: '#006064',
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#00838f',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: false,
      decorativeColor: '#00bcd4',
      decorativeSize: '8px'
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '28px',
      containerBackground: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff6b6b 100%)',
      containerShadow: '0 12px 30px rgba(255, 107, 107, 0.4), 0 0 40px rgba(255, 126, 95, 0.3)',
      
      avatarSize: '102px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid #ffffff',
      avatarShadow: '0 0 25px rgba(255, 255, 255, 0.6), 0 8px 25px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
      
      titleFontSize: '33px',
      titleFontWeight: '800',
      titleColor: '#ffffff',
      titleMargin: '0 0 13px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: 'rgba(255, 255, 255, 0.95)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.8)',
      decorativeSize: '12px'
    }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    styles: {
      containerPadding: '35px',
      containerBorderRadius: '20px',
      containerBackground: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #1e40af 100%)',
      containerShadow: '0 10px 30px rgba(30, 58, 138, 0.4), 0 0 40px rgba(30, 64, 175, 0.3)',
      
      avatarSize: '92px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #3b82f6',
      avatarShadow: '0 0 22px rgba(59, 130, 246, 0.6), 0 6px 22px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      
      titleFontSize: '30px',
      titleFontWeight: '600',
      titleColor: '#3b82f6',
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#93c5fd',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#3b82f6',
      decorativeSize: '9px'
    }
  },
  {
    id: 'electric-yellow',
    name: 'Electric Yellow',
    styles: {
      containerPadding: '37px',
      containerBorderRadius: '22px',
      containerBackground: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      containerBorder: '2px solid #ffff00',
      containerShadow: '0 0 35px rgba(255, 255, 0, 0.5), 0 10px 25px rgba(0, 0, 0, 0.4)',
      
      avatarSize: '96px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #ffff00',
      avatarShadow: '0 0 25px rgba(255, 255, 0, 0.7), 0 0 50px rgba(255, 255, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #ffff00 0%, #ffd700 100%)',
      
      titleFontSize: '32px',
      titleFontWeight: '700',
      titleColor: '#ffff00',
      titleMargin: '0 0 12px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: '#ffeb3b',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#ffff00',
      decorativeSize: '11px'
    }
  },
  {
    id: 'rose-gold-elegant',
    name: 'Rose Gold Elegant',
    styles: {
      containerPadding: '39px',
      containerBorderRadius: '26px',
      containerBackground: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      containerBorder: '2px solid #e91e63',
      containerShadow: '0 8px 25px rgba(233, 30, 99, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      
      avatarSize: '98px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #e91e63',
      avatarShadow: '0 0 20px rgba(233, 30, 99, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
      
      titleFontSize: '32px',
      titleFontWeight: '600',
      titleColor: '#ad1457',
      titleMargin: '0 0 12px 0',
      
      descriptionFontSize: '18px',
      descriptionColor: '#c2185b',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: false,
      decorativeColor: '#e91e63',
      decorativeSize: '8px'
    }
  },
  {
    id: 'steel-gray-modern',
    name: 'Steel Gray Modern',
    styles: {
      containerPadding: '33px',
      containerBorderRadius: '16px',
      containerBackground: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      containerBorder: '1px solid #9ca3af',
      containerShadow: '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      
      avatarSize: '86px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #9ca3af',
      avatarShadow: '0 0 18px rgba(156, 163, 175, 0.5), 0 5px 18px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
      
      titleFontSize: '29px',
      titleFontWeight: '600',
      titleColor: '#f3f4f6',
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#d1d5db',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#9ca3af',
      decorativeSize: '9px'
    }
  },
  {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    styles: {
      containerPadding: '41px',
      containerBorderRadius: '30px',
      containerBackground: 'rgba(255, 255, 255, 0.05)',
      containerBorder: '1px solid rgba(255, 255, 255, 0.1)',
      containerShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      
      avatarSize: '104px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(255, 255, 255, 0.3)',
      avatarShadow: '0 0 25px rgba(255, 255, 255, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
      
      titleFontSize: '34px',
      titleFontWeight: '600',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      titleMargin: '0 0 13px 0',
      
      descriptionFontSize: '19px',
      descriptionColor: 'rgba(255, 255, 255, 0.7)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: false,
      decorativeColor: 'rgba(255, 255, 255, 0.5)',
      decorativeSize: '10px'
    }
  },
  {
    id: 'volcanic-red',
    name: 'Volcanic Red',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '24px',
      containerBackground: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)',
      containerShadow: '0 10px 30px rgba(220, 38, 38, 0.4), 0 0 40px rgba(153, 27, 27, 0.3)',
      
      avatarSize: '100px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid #fca5a5',
      avatarShadow: '0 0 25px rgba(252, 165, 165, 0.6), 0 6px 25px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
      
      titleFontSize: '33px',
      titleFontWeight: '800',
      titleColor: '#fca5a5',
      titleMargin: '0 0 13px 0',
      titleLetterSpacing: '1px',
      
      descriptionFontSize: '18px',
      descriptionColor: '#fecaca',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: '#fca5a5',
      decorativeSize: '12px'
    }
  }
]

export const defaultProfilePresetId = 'cyberpunk-matrix'

export function getProfilePresetById(id: string): ProfilePreset | undefined {
  return profilePresets.find(preset => preset.id === id)
}