import React, {useState} from 'react' // * import useState to handle the state of the inputs
import axios from 'axios';
const LOGIN_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/login';
import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom'; // * import Link to handle the navigation between pages
import '../index.css'; // * import the css file to style the components
import { EyeOff, Eye } from 'lucide-react';



function Login() {
    document.title = 'SIL Tauste - Login'; // * set the title of the page
    const [cookies, setCookie] = useCookies(['token']);
    
    const navigate = useNavigate(); // * create a instance of useNavigate to handle the navigation

    //! * create a user object to handle the login
   
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false); // * create a state to handle the visibility of the password input

    //* this function toggles the visibility of the password input
    const togglePasswordVisibility = () => {
        setVisible(!visible);
    }
    //* this function captures the username input and sets the username state
    const handleUsernameChange = (e) => {
        e.preventDefault();
        setUsername(e.target.value);
    }
    //* this function captures the password input and sets the password state
    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
    }
    //* this function handles the submit event of the form and checks if the username and password are correct
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const response = await axios.post(LOGIN_URL+'/login', {
            username,
            password
          });
      
          //* assume that the token comes in response.data.token

          const token = response.data.token;
          //* save the cookie with the token
          setCookie('token', token, { path: '/', maxAge: 3600 }); // 1 hour
     //! set user in local storage 1 hour
     function setUserWithExpiry(username) {
      Swal.fire({
        title: '¡Acceso concedido!',
        text: `Bienvenido, ${username} la sesion expirará en 1 hora.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
  const expiry = Date.now() + 3600 * 1000; // 1 hour in milliseconds
  localStorage.setItem('username', username);

// Set a timeout to remove the user after 1 hour
  setTimeout(() => {
    localStorage.removeItem('username');
    setCookie('token', '', { path: '/' }); // Clear the cookie
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    navigate('/login');
  }, 3600 * 1000); // 1 hora en ms
}
  setUserWithExpiry(username);

          //* navigate to the main page
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
      
  //!jsx code
  return (

    <div className="min-h-screen">
      {/* Login + Imagen. Versión escritorio: dos columnas */}
      <div className="hidden lg:grid grid-cols-2 min-h-screen">
        {/* Columna izquierda: Formulario */}
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          <div className='w-2/3 flex justify-center items-center'>
            <div className="w-100 p-6 rounded bg-white shadow">
              {/* Logo de SIL */}
              <div className="flex justify-center p-8 bg-[#002856] rounded-t-lg">
                <img src="/SIL-logo-tech.png" alt="Logo" className="mb-6 w-50" />
              </div>
              
              {/* Formulario */}
              <form className="mt-8">

                <div className="space-y-5">
                  <label htmlFor="" className="text-base font-medium text-gray-900"> Usuario </label>

                  <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className="ti ti-user text-xl"></i>
                    </div>
                    <input type="text" name="" id="" placeholder="" onChange={handleUsernameChange}
                    className="w-full p-3 border rounded" />
                  </div>
                  
                  <div className='mb-8'>
                    <div className="flex justify-between items-center">
                      <label htmlFor="" className="text-base font-medium text-gray-900"> Contraseña</label>
                      <Link 
                        to="/forgot"
                        className="text-sm font-medium text-sky-500 underline">
                          Olvidaste tu contraseña
                      </Link>
                    </div>
                    
                    <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i className="ti ti-fingerprint text-xl"></i>
                      </div>
                      
                      <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600 w-full">
                        {/* Icono fingerprint a la izquierda */}
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                          <i className="ti ti-fingerprint text-xl"></i>
                        </div>
                        {/* eye */}
                        <input
                          type={visible ? "text" : "password"}
                          onChange={handlePasswordChange}
                          value={password}
                          className="w-full p-3 border rounded"
                          placeholder=""
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
                  </div>

                  <div>
                    <button type="submit"
                      className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 border border-transparent rounded-md focus:outline-none hover:opacity-80 focus:opacity-80 bg-[#002856]"
                      onClick={handleSubmit}>
                      Acceder
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Columna derecha: Torre de Tauste */}
        <div className="fixed top-0 right-0 h-screen w-1/2 object-cover">
          <img src="/loginimg.jpg" alt="Torre de Tauste" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 h-25
          bg-gradient-to-t from-zinc-800 to-transparent"></div>
        </div>
      </div>

      {/* Versión móvil */}
      <div className="block lg:hidden">
        {/* Imagen de cabecera */}
        <div className="flex justify-center bg-[#002856]">
          <img src="/SIL-logo-tech.png" alt="Logo de SIL" className="m-5"/>
        </div>

        {/* Formulario móvil */}
        <div className="flex justify-center items-center">
          <div className="w-3/4 p-7 rounded bg-white shadow mt-[10%]">
            <form className="w-full max-w-sm mx-auto space-y-4">
              <h2 className="flex justify-center items-center text-xl font-semibold 5xl">Iniciar sesión</h2>
              <hr className="border-t border-gray-300 my-4"/>
              <label htmlFor="" className="text-base font-medium text-gray-900"> Usuario </label>
              
              <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <i className="ti ti-user text-xl"></i>
                </div>
                <input type="text" name="" id="" placeholder="" onChange={handleUsernameChange}
                className="w-full p-3 border rounded" />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="" className="text-base font-medium text-gray-900">Contraseña</label>
                  <Link to="/forgot"
                    className="text-sm font-medium text-sky-500 underline">
                      Olvidaste tu contraseña
                  </Link>
                </div>
                
                <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600 w-full mb-8">
                  {/* Icono fingerprint a la izquierda */}
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <i className="ti ti-fingerprint text-xl"></i>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute top-1/2 right-3 -translate-y-1/2"
                      tabIndex={-1}
                      >
                      {visible ? (
                      <EyeOff className=""></EyeOff>
                      ) : (
                      <Eye className=""></Eye>
                      )}
                    </button>
                  </div>
                  {/* eye */}
                  <input
                    type={visible ? "text" : "password"}
                    onChange={handlePasswordChange}
                    value={password}
                    className="w-full p-3 border rounded"
                    placeholder=""
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

              <div>
                <button type="submit"
                  className="inline-flex items-center justify-center 
                  w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 
                  border border-transparent rounded-md focus:outline-none hover:opacity-80 focus:opacity-80 bg-[#002856]"
                  onClick={handleSubmit}>
                  Acceder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
);
}

export default Login;

