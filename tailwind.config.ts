import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff4b6e',
        'primary-dark': '#e63055',
        secondary: '#a78bfa',
        accent: '#06b6d4',
        bg: '#0a0a14',
        surface: '#12121f',
        card: '#1a1a2e',
        'card-hover': '#1f1f38',
        border: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff4b6e, #a78bfa)',
        'gradient-secondary': 'linear-gradient(135deg, #a78bfa, #06b6d4)',
        'gradient-surface': 'linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)',
        'gradient-card':
          'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-mesh':
          'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(255, 75, 110, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(167, 139, 250, 0.07) 0%, transparent 60%)',
        'shimmer':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease both',
        'slide-down': 'slideDown 0.3s ease both',
        'slide-up': 'slideUp 0.3s ease both',
        'scale-in': 'scaleIn 0.25s ease both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'toast-in': 'toast-in 0.35s ease both',
        'toast-out': 'toast-out 0.35s ease both',
      },
      boxShadow: {
        'glow-primary': '0 0 40px rgba(255, 75, 110, 0.15)',
        'glow-secondary': '0 0 40px rgba(167, 139, 250, 0.15)',
        'glow-strong': '0 0 60px rgba(255, 75, 110, 0.3), 0 0 100px rgba(255, 75, 110, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 40px rgba(0, 0, 0, 0.5)',
        'button-primary': '0 8px 30px rgba(255, 75, 110, 0.25)',
        'button-secondary': '0 8px 30px rgba(167, 139, 250, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'swift': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
