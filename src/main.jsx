// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

// ⬇️ 여기만 v2로 바꾸세요
import App from './KidsStockApp.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
