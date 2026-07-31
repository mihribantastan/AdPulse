/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        frankie: {
          bg: '#F9FAFB',     /* Göz yormayan uçuk gri/kemik arka plan */
          card: '#FFFFFF',   /* Kartlar için tertemiz saf beyaz */
          border: '#E5E7EB', /* Çok yumuşak, zarif açık gri çerçeve */
          text: '#111827',   /* Saf siyah yerine göz yormayan koyu füme */
          muted: '#6B7280',  /* Okunabilir yumuşak gri */
          hover: '#F3F4F6',  /* Hover durumu için tatlı bir açık gri */
          accent: '#0F172A'  /* Butonlar için premium koyu lacivert/siyah */
        }
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