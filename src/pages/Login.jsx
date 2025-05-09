import React, {useState} from 'react'

import { useNavigate } from 'react-router-dom';
function Login() {
    const navigate = useNavigate();
    const user = {
        username: 'admin',
        password: 'admin'
    }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleUsernameChange = (e) => {
        e.preventDefault();
        setUsername(e.target.value);
    }
    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === user.username && password === user.password) {
            alert('Login successful');
            navigate('/');
          
        } else {
            alert('Invalid username or password');
        }
    }
  
   return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative w-full h-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.rockefellerfoundation.org%2Fwp-content%2Fuploads%2FNYC-street-scene.jpeg&f=1&nofb=1&ipt=c22ca5a51088bb6bec0a7cbb6756399700812516b2d25562c4947109896cfb47')`,
            backgroundSize: 'cover',
          }}
        />
      </div>
      
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-[480px] bg-gray-800 opacity-85 flex flex-col justify-center">
        <div className="px-8 sm:px-12 md:px-16 w-full">
          <h1 className="text-6xl font-light text-white mb-16">Login</h1>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-gray-300 text-sm">
                Nombre de usuario:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className="w-full p-3 rounded bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-300 text-sm">
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded bg-white"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors"
            >
              Acceder
            </button>
            
            <div className="text-center mt-4">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                ¿Has olvidado tu contraseña?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default Login