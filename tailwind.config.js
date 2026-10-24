/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '88': '22rem',
      },
      colors: {
        hud: {
          base: '#080a0f',
          surface: '#0e121a',
          raised: '#141a24',
          elevated: '#1a2230',
          overlay: '#202a3c',
          borderSubtle: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          borderStrong: 'rgba(255, 255, 255, 0.22)',
          accent: '#38bdf8',
          accentHover: '#0ea5e9',
          radiant: '#22c55e',
          dire: '#ef4444',
          gold: '#eab308',
          textPrimary: '#f1f5f9',
          textSecondary: '#94a3b8',
          textMuted: '#64748b'
        },
        dota: {
          bg: '#080a0f',
          panel: '#0e121a',
          panelAlt: '#141a24',
          card: '#141a24',
          border: 'rgba(255, 255, 255, 0.12)',
          borderLight: 'rgba(255, 255, 255, 0.22)',
          red: '#ef4444',
          crimson: '#dc2626',
          gold: '#eab308',
          goldBright: '#facc15',
          str: '#f87171',
          agi: '#4ade80',
          int: '#38bdf8',
          uni: '#c084fc',
          radiant: '#22c55e',
          dire: '#ef4444',
          mana: '#38bdf8'
        }
      },
      fontFamily: {
        dota: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'monospace']
      },
      boxShadow: {
        'hud-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'hud-popover': '0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.8)'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeInLeft: 'fadeInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
