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
        // Superficies de Concreto Pulido y Papel Técnico
        concrete: {
          50: '#FAF9F5',  // Blanco Caliza (tarjetas y contenedores)
          100: '#F2F0EA', // Piedra / Concreto Claro (fondo general body)
          200: '#E8E5DC', // Gris Mortero (paneles secundarios, filtros)
          300: '#D6D3C9', // Borde arquitectónico sólido 1px
          400: '#B8B5AB',
          500: '#969389',
          600: '#78766F', // Texto secundario
          700: '#57564F',
          800: '#383733',
          900: '#181816', // Carbón Asfalto Puro
        },
        // Superficies de Alto Contraste: Asfalto Seco & Hierro Fundido
        asphalt: {
          950: '#111110', // Hierro fundido ultra profundo
          900: '#181816', // Carbón Asfalto Puro (Fondo del Hero)
          850: '#1D1D1A',
          800: '#232320', // Grafito Mate (Tarjetas internas del Hero)
          750: '#2C2C28',
          700: '#363632', // Borde oscuro 1px
          650: '#3F3E3A', // Borde del badge técnico
          600: '#4A4944', // Borde botón secundario
          500: '#706E66',
          400: '#A8A69E', // Texto secundario del Hero
          300: '#D4D1C7',
          200: '#E7E5DF',
          100: '#F5F4F0', // Blanco hueso (Titular Hero)
          50: '#FAF9F5',
        },
        // Color de Acento Primario: Naranja Terracota / Óxido Maquinaria (Hitachi/Hilti)
        terracotta: {
          50: '#FFF5F0',
          100: '#FFE8DE',
          200: '#FFCFBD',
          300: '#FFA78A',
          400: '#F27A52',
          500: '#E05A2B', // Acento titular "& Construye."
          600: '#D94E1F', // Primario maquinaria pesada
          700: '#B83D14', // Hover primario
          800: '#943010',
          900: '#7A270D',
        },
        // Colores Semánticos de Ingeniería Civil
        engineering: {
          green: '#1E6F43',
          'green-bg': '#E3F1E8',
          'green-border': '#A7D7B8',
          amber: '#B45309',
          'amber-bg': '#FEF3C7',
          'amber-border': '#FCD34D',
          red: '#B91C1C',
          'red-bg': '#FEE2E2',
          'red-border': '#FCA5A5',
          ochre: '#CA8A04',
          'ochre-light': '#EAB308',
        },
        // Tokens de Marca RentaMaq
        brand: {
          primary: '#D94E1F',
          'primary-hover': '#B83D14',
          accent: '#E05A2B',
          bg: '#F2F0EA',
          card: '#FAF9F5',
          mortar: '#E8E5DC',
          asphalt: '#181816',
          graphite: '#232320',
          border: '#D6D3C9',
          'border-dark': '#363632',
        },
        // Compatibilidad: Reasignar obsidian e indigo al nuevo sistema cromático mineral
        obsidian: {
          950: '#111110',
          900: '#181816',
          850: '#1D1D1A',
          800: '#232320',
          750: '#2C2C28',
          700: '#363632',
          600: '#4A4944',
          500: '#706E66',
          400: '#A8A69E',
          300: '#D6D3C9',
          200: '#E8E5DC',
          100: '#F2F0EA',
          50: '#FAF9F5',
        },
        indigo: {
          950: '#7A270D',
          900: '#943010',
          800: '#B83D14',
          700: '#C44318',
          600: '#D94E1F', // Terracota Primario
          500: '#E05A2B', // Acento
          400: '#F27A52',
          300: '#FFA78A',
          200: '#FFCFBD',
          100: '#FFE8DE',
          50: '#FFF5F0',
        }
      },
      boxShadow: {
        'technical': '0 1px 3px 0 rgba(24, 24, 22, 0.08), 0 1px 2px -1px rgba(24, 24, 22, 0.06)',
        'card-industrial': '0 4px 16px -2px rgba(24, 24, 22, 0.06)',
        'hero-card': '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
        modal: '0 25px 60px -15px rgba(24, 24, 22, 0.45)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
