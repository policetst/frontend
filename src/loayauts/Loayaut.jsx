import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, User, LogOut, Home, Settings } from 'lucide-react';
import '../index.css';
import { Menu, X, User, LogOut, Home, Settings } from 'lucide-react';

function Layout() {
  const handleLogout = () => {
    window.location.href = '/#/login';
    console.log('User logged out');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay for mobile and desktop sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg 
          transform transition-transform duration-300 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gray-100 border-b">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition"
            >
              Arba Dev
            </Link>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={toggleSidebar}
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 py-6">
            <ul className="space-y-1 px-2">
              <li>
                <Link
                  to="/crear-incidencia"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Home className="mr-3 w-5 h-5" />
                  Crear incidencia
                </Link>
              </li>
              <li>
                <Link
                  to="/perfil"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <User className="mr-3 w-5 h-5" />
                  Perfil
                </Link>
              </li>
              <li>
                <Link
                  to="/personas"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Personas
                </Link>
              </li>
              <li>
                <Link
                  to="/mapa"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Mapa
                </Link>
              </li>
              <li>
                <Link
                  to="/incidencia"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Incidencias
                </Link>
              </li>
              <li>
                <Link
                  to="/estadisticas"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Estadísticas
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Página Principal
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-4 border-t bg-gray-50 text-sm text-gray-600">
            © {new Date().getFullYear()} Tauste
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white shadow-md">
          <div className="flex items-center">
            <button
              className="text-gray-300 hover:text-cyan-500 mr-4"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-400">Sistema de Incidencias Locales Tauste</h1>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/perfil"
              className="flex items-center text-gray-100 hover:text-cyan-500 transition"
            >
              <User className="w-7 h-7" />
            </Link>
            <button
              className="text-gray-100 hover:text-red-600 transition"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-7 h-7" onClick={handleLogout} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-3 bg-white shadow-md">
          <div className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Tauste. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;