import React, {useState} from 'react' // * import useState to handle the state of the inputs

import { Link, useNavigate } from 'react-router-dom'; // * import Link to handle the navigation between pages
import '../index.css'; // * import the css file to style the components
function Login() {
    const navigate = useNavigate(); // * create a instance of useNavigate to handle the navigation

    //! * create a user object to handle the login
    const user = {
        username: 'admin',
        password: 'admin'
    }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === user.username && password === user.password) {
            navigate('/'); // * navigate to the home page
          
        } else {
            alert('Invalid username or password');
        }
    }
  //!jsx code
  return (

<div>
  <>
    <section className="bg-white font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-center px-4 py-7 bg-white sm:px-6 lg:px-8 sm:py-16 lg:py-24">
                <div className="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto sm:relative">
                    <p
                        className="text-3xl font-bold text-gray-900 mb-6 bloc">Acceso</p>
                    <form className="mt-8">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="" className="text-base font-medium text-gray-900"> Usuario </label>
                                <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <i className="ti ti-user text-xl"></i>
                                    </div>

                                    <input type="text" name="" id="" placeholder="" onChange={handleUsernameChange}
                                        className="block w-full py-4 ps-10 pe-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-sky-600 focus:bg-white caret-sky-600" />
                                </div>

                            </div>

                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="" className="text-base font-medium text-gray-900"> Contraseña</label>
                                    <Link to="/forgot"
                                        className="text-sm font-medium text-sky-500 underline">Olvidaste tu contraseña</Link>
                                </div>
                                <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <i className="ti ti-fingerprint text-xl"></i>
                                    </div>

                                    <input type="password" name="" id="" placeholder="" onChange={handlePasswordChange}
                                        className="block w-full py-4 ps-10 pe-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-sky-600 focus:bg-white caret-sky-600" />
                                </div>
                            </div>

                            <div>
                                <button type="submit"
                                    className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 border border-transparent rounded-md focus:outline-none hover:opacity-80 focus:opacity-80 bg-blue-400"
                                    
                                    onClick={handleSubmit}>
                                    Acceder
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-3 space-y-3">
                   

                       
                    </div>
                </div>
            </div>

            <div
                className="relative flex items-end px-4 pb-10 pt-60 sm:pb-16 md:justify-center lg:pb-24 bg-cover bg-center sm:px-6 lg:h-screen lg:px-8 lg:bg-[url('/loginimg.jpg')] ">
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900 to-transparent hidden"></div>

         
            </div>
        </div>
    </section>
  </>
</div>

  )
}

export default Login