/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        site: '#0f1720',
        cloud: '#f8fafc',
        carbon: {
          900: '#101820',
          800: '#152231',
          700: '#223042',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -30px rgba(0, 0, 0, 0.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        reveal: 'reveal 600ms ease-out forwards',
      },
    },
  },
  plugins: [],
}

