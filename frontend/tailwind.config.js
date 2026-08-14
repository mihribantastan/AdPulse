/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          950: '#0A0B0F',
          900: '#12141B',
          800: '#1B1E28',
          700: '#292D3A',
          400: '#8B93A7',
          100: '#F1F3F7',
        },
        accent: {
          600: '#1893B3',
          500: '#33C2E8',
          400: '#6FD9F2',
          100: '#CFF3FA',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}