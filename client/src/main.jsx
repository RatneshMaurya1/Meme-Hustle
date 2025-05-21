import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MemeProvider } from './context/MemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemeProvider>
      <App />
    </MemeProvider>
  </React.StrictMode>,
)
