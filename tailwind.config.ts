import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gossi: {
          red:    '#FF2D55',
          purple: '#BF5AF2',
          orange: '#FF9F0A',
          green:  '#30D158',
          blue:   '#0A84FF',
          wa:     '#25D366',
        },
        dark: {
          bg:      '#080808',
          surface: '#111111',
          card:    '#161616',
          border:  'rgba(255,255,255,0.06)',
        },
        card: {
          pink:   '#FFE5ED',
          purple: '#EDE5FF',
          blue:   '#E5EEFF',
          mint:   '#E5FFF1',
          yellow: '#FFF9E5',
        },
      },
      animation: {
        'fade-up':     'fadeUp 0.35s ease forwards',
        'slide-up':    'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        'bounce-pop':  'bouncePop 0.28s ease',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bouncePop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.35)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      backgroundImage: {
        'gossi-gradient':  'linear-gradient(135deg, #FF2D55 0%, #BF5AF2 100%)',
        'gossi-gradient2': 'linear-gradient(135deg, #FF9F0A 0%, #FF2D55 100%)',
        'dark-gradient':   'linear-gradient(180deg, #080808 0%, #0f0f0f 100%)',
      },
      boxShadow: {
        'gossi-red':    '0 0 24px rgba(255,45,85,0.35)',
        'gossi-purple': '0 0 24px rgba(191,90,242,0.35)',
        'card-glow':    '0 4px 24px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
