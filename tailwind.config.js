/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dota: {
          bg: '#0a0d14',
          panel: '#121722',
          panelAlt: '#181f2e',
          card: '#1c2436',
          border: '#2a354c',
          borderLight: '#3f4f70',
          red: '#c0392b',
          crimson: '#e74c3c',
          gold: '#e5b869',
          goldBright: '#ffd700',
          str: '#ec3d3d',
          agi: '#2ce347',
          int: '#00d2ff',
          uni: '#d946ef',
          radiant: '#5bb83c',
          dire: '#e04e39',
          mana: '#2575fc'
        }
      },
      fontFamily: {
        dota: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'dota-glow': '0 0 15px rgba(229, 184, 105, 0.25)',
        'dota-crimson': '0 0 20px rgba(231, 76, 60, 0.35)',
        'dota-mana': '0 0 20px rgba(0, 210, 255, 0.35)',
        'dota-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.6)'
      }
    },
  },
  plugins: [],
}
