
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'

// Get the current base path from the environment or default to '/'
const basePath = import.meta.env.BASE_URL || '/'
console.log('Base path:', basePath)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
