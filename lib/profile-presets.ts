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
    containerBackgroundSize?: string
    
    // Avatar styles
    avatarSize: string
    avatarBorderRadius: string
    avatarBorder?: string
    avatarShadow: string
    avatarBackground: string
    
    // Title styles (positioning only)
    titleMargin: string
    
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
      
      titleMargin: '0 0 12px 0',
      
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
      
      titleMargin: '0 0 15px 0',
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
      
      titleMargin: '0 0 10px 0',
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
      
      titleMargin: '0 0 14px 0',
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
      
      titleMargin: '0 0 8px 0',
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
      
      titleMargin: '0 0 12px 0',
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
      
      titleMargin: '0 0 13px 0',
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
      
      titleMargin: '0 0 14px 0',
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
      
      titleMargin: '0 0 11px 0',
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
      
      titleMargin: '0 0 13px 0',
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
      
      titleMargin: '0 0 12px 0',
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
      
      titleMargin: '0 0 13px 0',
      descriptionFontSize: '18px',
      descriptionColor: '#fecaca',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: '#fca5a5',
      decorativeSize: '12px'
    }
  },
  // === CLEAN & MINIMAL THEMES ===
  {
    id: 'clean-solid-minimal',
    name: 'Clean Solid Minimal',
    styles: {
      containerPadding: '32px',
      containerBorderRadius: '12px',
      containerBackground: 'rgba(248, 249, 250, 0.95)',
      containerBorder: '1px solid rgba(233, 236, 239, 0.8)',
      containerShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      
      avatarSize: '88px',
      avatarBorderRadius: '50%',
      avatarBorder: '2px solid rgba(108, 117, 125, 0.2)',
      avatarShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      avatarBackground: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      
      titleMargin: '0 0 8px 0',
      
      descriptionFontSize: '16px',
      descriptionColor: '#6c757d',
      descriptionMargin: '0',
      descriptionLineHeight: '1.5',
      
      showDecorativeElements: false,
      decorativeColor: '#6c757d',
      decorativeSize: '6px'
    }
  },
  {
    id: 'paper-noise-warm',
    name: 'Paper Noise Warm',
    styles: {
      containerPadding: '36px',
      containerBorderRadius: '16px',
      containerBackground: 'rgba(254, 254, 254, 0.98)',
      containerBorder: '1px solid rgba(245, 245, 245, 0.8)',
      containerShadow: '0 6px 25px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      
      avatarSize: '92px',
      avatarBorderRadius: '50%',
      avatarBorder: '2px solid rgba(139, 69, 19, 0.3)',
      avatarShadow: '0 6px 20px rgba(139, 69, 19, 0.15)',
      avatarBackground: 'linear-gradient(135deg, #d2691e 0%, #cd853f 100%)',
      
      titleMargin: '0 0 10px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#a0522d',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: false,
      decorativeColor: '#d2691e',
      decorativeSize: '8px'
    }
  },
  {
    id: 'micro-dots-tech',
    name: 'Micro Dots Tech',
    styles: {
      containerPadding: '34px',
      containerBorderRadius: '14px',
      containerBackground: 'rgba(250, 251, 252, 0.95)',
      containerBorder: '1px solid rgba(229, 231, 235, 0.6)',
      containerShadow: '0 5px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      
      avatarSize: '90px',
      avatarBorderRadius: '50%',
      avatarBorder: '2px solid rgba(59, 130, 246, 0.3)',
      avatarShadow: '0 5px 18px rgba(59, 130, 246, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      
      titleMargin: '0 0 9px 0',
      
      descriptionFontSize: '16px',
      descriptionColor: '#3730a3',
      descriptionMargin: '0',
      descriptionLineHeight: '1.5',
      
      showDecorativeElements: false,
      decorativeColor: '#3b82f6',
      decorativeSize: '7px'
    }
  },
  // === GRADIENT THEMES ===
  {
    id: 'duo-gradient-elegant',
    name: 'Duo Gradient Elegant',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '24px',
      containerBackground: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      containerBorder: '1px solid rgba(102, 126, 234, 0.2)',
      containerShadow: '0 8px 30px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      
      avatarSize: '100px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(102, 126, 234, 0.4)',
      avatarShadow: '0 8px 25px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      avatarBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      titleMargin: '0 0 12px 0',
      
      descriptionFontSize: '18px',
      descriptionColor: '#5b21b6',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#667eea',
      decorativeSize: '10px'
    }
  },
  {
    id: 'living-gradient-vibrant',
    name: 'Living Gradient Vibrant',
    styles: {
      containerPadding: '42px',
      containerBorderRadius: '28px',
      containerBackground: 'linear-gradient(45deg, rgba(238, 119, 82, 0.1), rgba(231, 60, 126, 0.1), rgba(35, 166, 213, 0.1), rgba(35, 213, 171, 0.1))',
      containerBorder: '2px solid rgba(255, 255, 255, 0.3)',
      containerShadow: '0 12px 35px rgba(0, 0, 0, 0.1), 0 0 50px rgba(238, 119, 82, 0.2)',
      
      avatarSize: '110px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid rgba(255, 255, 255, 0.6)',
      avatarShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 10px 30px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #ee7752 0%, #e73c7e 50%, #23a6d5 100%)',
      
      titleMargin: '0 0 15px 0',
      descriptionFontSize: '19px',
      descriptionColor: 'rgba(255, 255, 255, 0.9)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.7)',
      decorativeSize: '12px'
    }
  },
  {
    id: 'rainbow-shift-psychedelic',
    name: 'Rainbow Shift Psychedelic',
    styles: {
      containerPadding: '44px',
      containerBorderRadius: '32px',
      containerBackground: 'linear-gradient(45deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1), rgba(69, 183, 209, 0.1), rgba(150, 206, 180, 0.1), rgba(255, 234, 167, 0.1), rgba(253, 121, 168, 0.1))',
      containerBorder: '2px solid rgba(255, 255, 255, 0.4)',
      containerShadow: '0 15px 40px rgba(0, 0, 0, 0.1), 0 0 60px rgba(255, 107, 107, 0.3)',
      
      avatarSize: '112px',
      avatarBorderRadius: '50%',
      avatarBorder: '4px solid rgba(255, 255, 255, 0.7)',
      avatarShadow: '0 0 35px rgba(255, 255, 255, 0.5), 0 12px 35px rgba(0, 0, 0, 0.2)',
      avatarBackground: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
      
      titleMargin: '0 0 16px 0',
      descriptionFontSize: '20px',
      descriptionColor: 'rgba(255, 255, 255, 0.95)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.8',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.8)',
      decorativeSize: '14px'
    }
  },
  // === ANIMATED THEMES ===
  {
    id: 'liquid-waves-flowing',
    name: 'Liquid Waves Flowing',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '26px',
      containerBackground: 'linear-gradient(135deg, rgba(240, 244, 248, 0.9) 0%, rgba(156, 146, 172, 0.1) 100%)',
      containerBorder: '1px solid rgba(156, 146, 172, 0.3)',
      containerShadow: '0 10px 30px rgba(156, 146, 172, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      
      avatarSize: '96px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(156, 146, 172, 0.4)',
      avatarShadow: '0 8px 25px rgba(156, 146, 172, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #9c92ac 0%, #6b5b95 100%)',
      
      titleMargin: '0 0 11px 0',
      
      descriptionFontSize: '17px',
      descriptionColor: '#6b5b95',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#9c92ac',
      decorativeSize: '9px'
    }
  },
  {
    id: 'fireflies-magical',
    name: 'Fireflies Magical',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '24px',
      containerBackground: 'linear-gradient(135deg, rgba(15, 12, 41, 0.9) 0%, rgba(48, 43, 99, 0.8) 50%, rgba(36, 36, 62, 0.9) 100%)',
      containerBorder: '1px solid rgba(255, 255, 255, 0.1)',
      containerShadow: '0 12px 35px rgba(0, 0, 0, 0.4), 0 0 50px rgba(255, 255, 255, 0.1)',
      
      avatarSize: '102px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(255, 255, 255, 0.3)',
      avatarShadow: '0 0 25px rgba(255, 255, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
      
      titleMargin: '0 0 13px 0',
      descriptionFontSize: '18px',
      descriptionColor: 'rgba(255, 255, 255, 0.7)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.6)',
      decorativeSize: '11px'
    }
  },
  {
    id: 'aurora-veil-cinematic',
    name: 'Aurora Veil Cinematic',
    styles: {
      containerPadding: '42px',
      containerBorderRadius: '30px',
      containerBackground: 'linear-gradient(135deg, rgba(250, 251, 252, 0.95) 0%, rgba(233, 236, 239, 0.9) 100%)',
      containerBorder: '1px solid rgba(120, 119, 198, 0.2)',
      containerShadow: '0 15px 40px rgba(120, 119, 198, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      
      avatarSize: '108px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(120, 119, 198, 0.3)',
      avatarShadow: '0 0 30px rgba(120, 119, 198, 0.3), 0 10px 30px rgba(0, 0, 0, 0.1)',
      avatarBackground: 'linear-gradient(135deg, #7877c6 0%, #a855f7 100%)',
      
      titleMargin: '0 0 14px 0',
      descriptionFontSize: '19px',
      descriptionColor: '#5b21b6',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: '#7877c6',
      decorativeSize: '12px'
    }
  },
  // === DARK & CYBER THEMES ===
  {
    id: 'cosmic-dust-space',
    name: 'Cosmic Dust Space',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '28px',
      containerBackground: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)',
      containerBorder: '1px solid rgba(255, 255, 255, 0.1)',
      containerShadow: '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 255, 255, 0.1)',
      
      avatarSize: '104px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(255, 255, 255, 0.2)',
      avatarShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 10px 30px rgba(0, 0, 0, 0.4)',
      avatarBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      
      titleMargin: '0 0 14px 0',
      descriptionFontSize: '19px',
      descriptionColor: 'rgba(255, 255, 255, 0.6)',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: 'rgba(255, 255, 255, 0.5)',
      decorativeSize: '13px'
    }
  },
  {
    id: 'matrix-rain-digital',
    name: 'Matrix Rain Digital',
    styles: {
      containerPadding: '36px',
      containerBorderRadius: '12px',
      containerBackground: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)',
      containerBorder: '2px solid #00ff00',
      containerShadow: '0 0 40px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
      
      avatarSize: '92px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #00ff00',
      avatarShadow: '0 0 25px rgba(0, 255, 0, 0.6), 0 0 50px rgba(0, 255, 0, 0.3)',
      avatarBackground: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
      
      titleMargin: '0 0 10px 0',
      descriptionFontSize: '17px',
      descriptionColor: '#00cc00',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#00ff00',
      decorativeSize: '8px'
    }
  },
  // === NEON & ELECTRIC THEMES ===
  {
    id: 'neon-grid-cyberpunk',
    name: 'Neon Grid Cyberpunk',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '16px',
      containerBackground: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)',
      containerBorder: '2px solid #00ffff',
      containerShadow: '0 0 50px rgba(0, 255, 255, 0.4), inset 0 0 25px rgba(0, 255, 255, 0.1)',
      
      avatarSize: '96px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #00ffff',
      avatarShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)',
      avatarBackground: 'linear-gradient(135deg, #00ffff 0%, #0099cc 100%)',
      
      titleMargin: '0 0 12px 0',
      descriptionFontSize: '18px',
      descriptionColor: '#00ccff',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#00ffff',
      decorativeSize: '10px'
    }
  },
  {
    id: 'electric-storm-dynamic',
    name: 'Electric Storm Dynamic',
    styles: {
      containerPadding: '40px',
      containerBorderRadius: '22px',
      containerBackground: 'linear-gradient(135deg, rgba(45, 27, 105, 0.95) 0%, rgba(17, 5, 44, 0.9) 100%)',
      containerBorder: '2px solid #8a2be2',
      containerShadow: '0 0 45px rgba(138, 43, 226, 0.5), inset 0 0 25px rgba(138, 43, 226, 0.2)',
      
      avatarSize: '100px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid #8a2be2',
      avatarShadow: '0 0 35px rgba(138, 43, 226, 0.8), 0 0 70px rgba(138, 43, 226, 0.4)',
      avatarBackground: 'linear-gradient(135deg, #8a2be2 0%, #6a1b9a 100%)',
      
      titleMargin: '0 0 13px 0',
      descriptionFontSize: '18px',
      descriptionColor: '#ba68c8',
      descriptionMargin: '0',
      descriptionLineHeight: '1.7',
      
      showDecorativeElements: true,
      decorativeColor: '#8a2be2',
      decorativeSize: '11px'
    }
  },
  // === NATURE & OCEAN THEMES ===
  {
    id: 'ocean-waves-calm',
    name: 'Ocean Waves Calm',
    styles: {
      containerPadding: '38px',
      containerBorderRadius: '26px',
      containerBackground: 'linear-gradient(135deg, rgba(116, 185, 255, 0.1) 0%, rgba(9, 132, 227, 0.1) 50%, rgba(45, 52, 54, 0.1) 100%)',
      containerBorder: '1px solid rgba(116, 185, 255, 0.3)',
      containerShadow: '0 10px 30px rgba(116, 185, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      
      avatarSize: '98px',
      avatarBorderRadius: '50%',
      avatarBorder: '3px solid rgba(116, 185, 255, 0.4)',
      avatarShadow: '0 8px 25px rgba(116, 185, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      avatarBackground: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      
      titleMargin: '0 0 12px 0',
      
      descriptionFontSize: '18px',
      descriptionColor: '#74b9ff',
      descriptionMargin: '0',
      descriptionLineHeight: '1.6',
      
      showDecorativeElements: true,
      decorativeColor: '#74b9ff',
      decorativeSize: '10px'
    }
  }
]

export const defaultProfilePresetId = 'cyberpunk-matrix'

export function getProfilePresetById(id: string): ProfilePreset | undefined {
  return profilePresets.find(preset => preset.id === id)
}