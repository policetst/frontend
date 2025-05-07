import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import ROUTER from './router/router.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={ROUTER} />
  </StrictMode>,
)
