import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOff, Eye } from 'lucide-react';
import '../index.css';

const LOGIN_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

function Login() {
  document.title = 'SIL Tauste - Login';

  const [cookies, setCookie] = useCookies(['token']);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${LOGIN_URL}/login`, {
        username,
        password,
      });

      const token = response.data.token;
      setCookie('token', token, { path: '/', maxAge: 3600 });

      const setUserWithExpiry = (username) => {
        Swal.fire({
          title: '¡Acceso concedido!',
          text: `Bienvenido, ${username}. La sesión expirará en 1 hora.`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

        const expiry = Date.now() + 3600 * 1000;
        localStorage.setItem('username', username);

        setTimeout(() => {
          localStorage.removeItem('username');
          setCookie('token', '', { path: '/' });
          Swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
          navigate('/login');
        }, 3600 * 1000);
      };

      setUserWithExpiry(username);
      navigate('/');
    } catch (error) {
      console.error('Error en el login:', error);
      Swal.fire({
        title: '¡Acceso denegado!',
        text: 'Usuario o contraseña incorrectos',
        icon: 'error',
        confirmButtonText: 'Reintentar',
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-2 min-h-screen">
        <div className="flex flex-col items-center justify-center p-8 bg-gray-200">
          <div className="w-2/3 flex justify-center items-center">
            <div className="w-full max-w-xl p-6 rounded border bg-white border-gray-400 shadow-xl">
              <div className="flex justify-center p-8 bg-[#002856] rounded-t-lg">
                <img src="/SIL-logo-tech.png" alt="Logo" className="mb-6 w-65" />
              </div>
              <form className="mt-8" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <label htmlFor="username" className="text-base font-medium text-gray-900">Usuario</label>
                  <div className="relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className="ti ti-user text-xl"></i>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 text-black transition-all duration-200 cursor-default
                      border-gray-400 border-1 rounded-md bg-gray-50 
                      focus:outline-none focus:border-[#002856] focus:bg-white
                      hover:bg-gray-100"
                    />
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-base font-medium text-gray-900">Contraseña</label>
                      <Link to="/forgot" className="text-sm font-medium text-sky-500 underline">
                        Recuperar contraseña
                      </Link>
                    </div>
                    <div className="relative text-gray-400 focus-within:text-gray-600">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i className="ti ti-fingerprint text-xl"></i>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={visible ? 'text' : 'password'}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="w-full p-3 text-black placeholder-gray-500 transition-all duration-200 cursor-default
                        border border-gray-400 rounded-md bg-gray-50 focus:outline-none focus:border-[#002856] focus:bg-white 
                        hover:bg-gray-200"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        tabIndex={-1}
                      >
                        {visible ? (
                          <EyeOff className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Eye className="w-6 h-6 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-4 font-semibold text-white bg-[#002856] rounded-md transition-all hover:opacity-80"
                  >
                    Acceder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="fixed top-0 right-0 h-screen w-1/2">
          <img src="/loginimg.jpg" alt="Torre de Tauste" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 h-25 bg-gradient-to-t from-zinc-800 to-transparent" />
        </div>
      </div>

      {/* Mobile */}
      <div className="block lg:hidden">
        <div className="flex justify-center bg-[#002856]">
          <img src="/SIL-logo-tech.png" alt="Logo de SIL" className="m-5" />
        </div>

        <div className="flex justify-center items-center">
          <div className="w-3/4 p-7 mt-[10%] rounded border border-gray-400 bg-white shadow-xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-center">Iniciar sesión</h2>
              <hr className="border-t border-gray-300 my-4" />

              <label htmlFor="username-mobile" className="text-base font-medium text-gray-900">Usuario</label>
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <i className="ti ti-user text-xl"></i>
                </div>
                <input
                  id="username-mobile"
                  name="username"
                  type="text"
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 text-black placeholder-gray-500 transition-all duration-200 
                  border border-gray-400 rounded-md bg-gray-50 focus:outline-none focus:border-gray-700 focus:bg-white"
                />
              </div>

              <label htmlFor="password-mobile" className="text-base font-medium text-gray-900">Contraseña</label>
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <i className="ti ti-fingerprint text-xl"></i>
                </div>
                <input
                  id="password-mobile"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full p-3 text-black placeholder-gray-500 transition-all duration-200 
                  border border-gray-400 rounded-md bg-gray-50 focus:outline-none focus:border-gray-700 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {visible ? <EyeOff className="w-6 h-6 text-gray-500" /> : <Eye className="w-6 h-6 text-gray-500" />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <Link to="/forgot" className="text-sm font-medium text-sky-500 underline">
                  Olvidaste tu contraseña
                </Link>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-4 font-semibold text-white bg-[#002856] rounded-md transition-all hover:opacity-80"
              >
                Acceder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
