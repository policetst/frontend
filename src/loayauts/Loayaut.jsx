  import React, { useState, useEffect } from 'react';
  import { useNavigate, Link, Outlet } from 'react-router-dom';
  import { useCookies } from 'react-cookie';
  import '../index.css';
  import Notifications from '../components/Notifications';
  import {
    Menu,
    X,
    UserSearch,
    LogOut,
    Home,
    Settings,
    CircleUserRound,
    Users,
    NotebookPen,
    NotebookText,
    Newspaper,
    Map,
    ChartColumn,
    House,
    BellRing,
    CarFront,
  } from 'lucide-react';



  function Layout() {
    const user_code = localStorage.getItem('username');
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    useEffect(() => {      
      if (cookies.token == "" || user_code == "") {
        navigate('/login');
      }
    }, [cookies, navigate]);
    

    const handleLogout = () => {
      setCookie('token', '', { path: '/' });
      setCookie('user', '', { path: '/' });
      window.location.href = '/#/login';
      console.log('User logged out');
    };
        window.addEventListener("beforeunload", handleLogout);
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
      <div className="flex h-screen bg-gray-50 overflow-hidden dark">
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
            <div className="flex justify-center px-4 py-4 bg-[#002856] border-b">
              <img src="/SIL-logo-tech.png" alt="Logo de SIL Tauste" style={{ width: '255px', height: '115px' }}/>
            </div>
            

            {/* Sidebar Menu */}
            <nav className="flex flex-col flex-1 justify-between py-6">
              <ul className="space-y-1 px-2">
                <li>
                  <Link
                    to="/crear-incidencia"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <NotebookPen className="mr-3 w-5 h-5" />
                    Crear incidencia
                  </Link>
                </li>
                <li>
                  <Link
                    to="/incidencia"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <NotebookText  className="mr-3 w-5 h-5" />
                    Mostrar Incidencia
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vehiculos"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <UserSearch className="mr-3 w-5 h-5" />
                    Personas y vehiculos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/estadisticas"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <ChartColumn className="mr-3 w-5 h-5" />
                    Estadísticas
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/personas"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <Users className="mr-3 w-5 h-5" /> 
                    Personas
                  </Link>
                </li> */}
                <li>
                  <Link
                    to="/mapa"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <Map className="mr-3 w-5 h-5" />
                    Mapa
                  </Link>
                </li>
                
                
              </ul>
              <ul className="space-y-1 px-2">
                <li>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <House className="mr-3 w-5 h-5" />
                    Página Principal
                  </Link>
                </li>
                <li>
                  <Link
                    to="/perfil"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                    onClick={closeSidebar}
                  >
                    <CircleUserRound className="mr-3 w-5 h-5" />
                    Gestion de usuario
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

        {/* header */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Hamburguesa */}
          <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 bg-[#222831] text-white shadow-md">
            <div className="flex items-center z-10">
              <button
                className="text-gray-300 hover:text-cyan-500 mr-4"
                onClick={toggleSidebar}
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            {/* Titulo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <img src="/SIL-logo-tech.png" alt="Logo de SIL Tauste" className="block sm:hidden w-[90px] h-[45px]"/>
              <h1 className="hidden sm:block text-2xl font-bold text-gray-100 whitespace-nowrap">
                SISTEMA DE INCIDENCIAS LOCALES
                {/* <span className="block sm:hidden">SIL TAUSTE</span>
                <span className="hidden sm:block">SISTEMA DE INCIDENCIAS LOCALES</span> */}
              </h1>
            </div>
            {/* Botones */}
            <div className="flex items-center space-x-6">
              {/* Campana de notificaciones */}
 <Notifications/>

              {/* Botón de logout */}
              <button
                className="flex items-center justify-center text-gray-100 hover:text-red-600 transition w-6 h-6"
                aria-label="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>

          </header>

          {/* Mostrar usuario actual */}
          <div className="h-10 w-full">
            <div className="h-10 flex items-center justify-center sm:justify-end text-gray-900 px-4">
              {/* <CircleUserRound className="mr-2 w-5 h-5" /> */}
              <p className="pr-1.5">Agente:</p>
              <Link
                to="/perfil"
                className="text-gray-900 hover:text-cyan-500 transition"
                onClick={closeSidebar}
              >
                {user_code}
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
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