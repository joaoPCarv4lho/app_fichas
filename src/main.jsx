import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ConfirmProvider } from './components/ConfirmDialog.jsx'
import AtualizacaoPwa from './components/AtualizacaoPwa.jsx'
import { iniciarPwa } from './lib/pwa.js'
import './lib/install.js' // captura o evento de instalação cedo
import './styles.css'

iniciarPwa()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true }}>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <App />
            <AtualizacaoPwa />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
