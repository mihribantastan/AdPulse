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
          /* Dış Alan (Aydınlık) */
          bg: '#f5f7fa',        /* İstediğin ana arka plan */
          text: '#0f172a',      /* Dışarıdaki koyu metinler (Başlıklar vb.) */
          muted: '#64748b',     /* Dışarıdaki soluk metinler */
          border: '#e2e8f0',    /* Dış çerçeveler */
          
          /* Kart İçi (Karanlık) */
          card: '#1e293b',      /* İstediğin kart rengi (Slate 800) */
          cardText: '#f8fafc',  /* Kart içindeki beyaz metinler */
          cardMuted: '#94a3b8', /* Kart içindeki soluk gri metinler */
          cardBorder: '#334155' /* Kartların ince çerçeveleri */
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