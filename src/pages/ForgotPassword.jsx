import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';

function ForgotPassword() {

    document.title = "Recuperar contraseña"
     const [email, setEmail] = useState('');
     const navigate = useNavigate();

     /**
      * resetPassword function to send a request to the backend to reset the password
      * @returns {Promise<void>}
      */
     const resetPassword = (email)=> {
  axios.post('https://arbadev-back-joq0.onrender.com/users/resetpassword', { email })
    .then(response => {
      Swal.fire({
        title: 'Éxito',
        text: 'Se ha enviado un correo electrónico para restablecer tu contraseña.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    })
    .then(() => {
      navigate('/login');
    })
    .catch(error => {
      console.error(error);
    });
}
     /**
     maneja el evento de cambio del input de correo electrónico
     @param {Event} e - evento de cambio
     @returns {void}
     */
    const handleEmailChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }
    /*
     maneja el evento de envío del formulario
     @param {Event} e - evento de envío
     @returns {void}
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() === '') {
            Swal.fire({
                title: 'Error',
                text: 'Por favor, ingresa tu correo electrónico.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        resetPassword(email);
    }
  return (
    <div>
        
        <section class="bg-white">
        <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="flex items-center justify-center bg-white px-6 py-16 lg:px-8 lg:py-24 ">
                
                <div class="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
                    <a href="#"
                        class="text-3xl font-bold text-gray-900 mb-6 block">¿Olvidaste tu contraseña?</a>
                    <Link class="text-sm font-medium text-sky-500 underline" to="/login"> Acceso
                    </Link>

                    <form class="mt-8">
                        <div class="space-y-5">
                            <div>
                                <label for="" class="text-base font-medium text-gray-900"> Correo de recuperación </label>
                                <div class="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <i class="ti ti-at text-xl"></i>
                                    </div>

                                    <input type="email" name="" id="" placeholder="" onChange={handleEmailChange}
                                        class="block w-full py-4 ps-10 pe-4 text-black placeholder-gray-500 transition-all duration-200 
                                        border border-gray-200 rounded-md 
                                        bg-gray-50 focus:outline-none focus:border-sky-600 focus:bg-white caret-sky-600" />
                                </div>
                            </div>

                            <div>
                                <button type="submit" onClick={handleSubmit}
                                    class="inline-flex items-center justify-center 
                                    w-full px-4 py-4 text-base font-semibold transition-all duration-200 
                                    border border-transparent bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9]">
                                    Recuperar contraseña
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div
                class="relative flex items-end px-4 pb-10 pt-60 sm:pb-16 md:justify-center 
                lg:pb-24 bg-cover bg-center sm:px-6 lg:h-screen lg:px-8 lg:bg-[url('/loginimg.jpg')]">
                <div class="absolute inset-0 bg-gradient-to-t from-sky-900 to-transparent hidden"></div>

                <div class="relative">
            
                </div>
            </div>
        </div>
    </section>
    </div>
  )
}

export default ForgotPassword