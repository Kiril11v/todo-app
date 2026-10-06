import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux"
import { store } from "./store/index.js"
import { ThemeProvider } from './context/ThemeProvider.tsx'
import { LanguageProvider } from './context/LanguageProvider.tsx'
import './index.css'
import { StrictMode } from 'react'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found')

  createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
