/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#05080f',
          900: '#090d16',
          850: '#0d131f',
          800: '#111827',
          750: '#172033',
          700: '#1e293b',
          600: '#334155',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        indigo: {
          950: '#1e1b4b',
          900: '#312e81',
          800: '#3730a3',
          700: '#4338ca',
          600: '#4f46e5',
          500: '#6366f1',
          400: '#818cf8',
          300: '#a5b4fc',
          200: '#c7d2fe',
          100: '#e0e7ff',
          50: '#eef2ff',
        },
        brand: {
          bg: '#090d16',
          card: '#0f172a',
          elevated: '#172033',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-focus': 'rgba(99, 102, 241, 0.5)',
          primary: '#4f46e5',
          'primary-hover': '#4338ca',
          accent: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#f8fafc',
          muted: '#94a3b8',
        }
      },
      boxShadow: {
        glow: '0 0 35px -5px rgba(99, 102, 241, 0.25)',
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.2)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.25)',
        card: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        modal: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
