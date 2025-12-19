import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Quiet Luxury Sauna Palette
        // Inspired by premium Scandinavian design, aged wood, and steam
        sauna: {
          // Paper & Canvas - warm whites
          paper: '#FAFAF8',
          linen: '#F5F3EF',
          cream: '#EBE8E2',

          // Stone & Earth - neutral grays with warmth
          ash: '#E0DDD7',
          fog: '#C5C2BC',
          stone: '#8B8884',
          slate: '#605C57',

          // Text hierarchy - warm blacks
          ink: '#2B2926',
          charcoal: '#1C1917',
          night: '#0F0E0D',

          // Wood tones - the soul of sauna
          birch: '#D4C9B8',
          cedar: '#B8A68A',
          oak: '#9D826B',
          walnut: '#7A6655',
          bark: '#4A403A',

          // Accent - understated warmth
          clay: '#A68B6B',
          sand: '#C4B5A0',
          brass: '#9A8560',
          bronze: '#7A6B55',

          // Heat - subtle, not screaming
          ember: '#B87B5A',
          glow: '#D4A574',
          warm: '#E8D5C4',

          // Legacy mappings for compatibility
          wood: '#9D826B',
          steam: '#FAFAF8',
          mist: '#E0DDD7',
          heat: '#B87B5A',
          copper: '#A68B6B',
          honey: '#C4B5A0',
          dark: '#2B2926',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'steam': 'steam 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-up-delayed': 'fadeUp 0.8s ease-out 0.2s forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        steam: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '0.3' },
          '100%': { opacity: '0', transform: 'translateY(-100px) scale(1.5)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'wood-grain': 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(157,130,107,0.03) 50px, rgba(157,130,107,0.03) 51px)',
      },
    },
  },
  plugins: [],
}

export default config
