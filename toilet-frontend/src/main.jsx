import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ★追加
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ★アプリ全体をこれで包みます */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
