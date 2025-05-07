// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NotFound from './pages/NotFound'
import Perfil from './pages/Perfil'
import Mapa from './pages/Mapa'
import Login from './pages/Login'
import MostrarIncidencia from './pages/MostrarIncidencia'
import Estadisticas from './pages/Estadisticas'
import CrearIncidencia from './pages/CrearIncidencia'
import Personas from './pages/Personas'
import PaginaPrincipal from './pages/PaginaPrincipal'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaPrincipal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/incidencia" element={<MostrarIncidencia />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/crear-incidencia" element={<CrearIncidencia />} />
        <Route path="/personas" element={<Personas />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
