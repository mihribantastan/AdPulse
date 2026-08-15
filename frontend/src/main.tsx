import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

document.documentElement.classList.add('dark')

// Açık/koyu tema tercihi - varsayılan koyu, kullanıcı seçtiyse hatırla
if (localStorage.getItem('adpulse_theme') === 'light') {
  document.documentElement.classList.add('light')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
