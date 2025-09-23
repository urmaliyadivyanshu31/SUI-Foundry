/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Typography
      fontFamily: {
        'sans': ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        'heading': ['"Mozilla Headline"', 'system-ui', 'sans-serif'],
        'mono': ['Monaco', 'Menlo', '"Ubuntu Mono"', 'monospace'],
      },
      
      // Color System - Clean Black & White
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        
        // Card and UI colors
        card: 'rgba(15, 15, 15, 0.8)',
        'card-foreground': '#ffffff',
        popover: 'rgba(20, 20, 20, 0.95)',
        'popover-foreground': '#ffffff',
        
        // Functional colors
        primary: '#ffffff',
        'primary-foreground': '#000000',
        secondary: 'rgba(255, 255, 255, 0.1)',
        'secondary-foreground': '#ffffff',
        muted: 'rgba(255, 255, 255, 0.05)',
        'muted-foreground': 'rgba(255, 255, 255, 0.6)',
        accent: '#ffffff',
        'accent-foreground': '#000000',
        destructive: '#EF4444',
        'destructive-foreground': '#ffffff',
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: 'rgba(255, 255, 255, 0.3)',
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.65' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
        '8xl': ['6rem', { lineHeight: '1' }],
      },
      
      // Animation System
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        }
      },
      
      // Box Shadow System
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
        'glow-lg': '0 0 30px rgba(255, 255, 255, 0.2)',
      },
      
      // Backdrop Blur
      backdropBlur: {
        'glass': '10px',
        'glass-heavy': '20px',
      }
    },
  },
  plugins: []
}