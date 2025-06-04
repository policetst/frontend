import React,{useState} from 'react'

import { Plus, Minus } from 'lucide-react'
const USERS_URL = import.meta.env.VITE_USERS_URL || 'http://localhost:4000/users';
import { createUser} from '../funcs/Users';
function AddUser() {
    const [newUser, setNewUser] = useState({
        code: '',
        email: '',
        password: '',
        role: '',
        status: 'Active',
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleAddUser = async () => {
        setIsOpen(!isOpen);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newUser.code || !newUser.email || !newUser.password || !newUser.role) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        const createdUser = await createUser(newUser);
        console.log("New User Data:", createdUser);
        if (createdUser.ok) {
            alert("Usuario creado correctamente.");
            setIsOpen(false);
            window.location.reload(); // Reload the page to see the new user
            setNewUser({
                code: '',
                email: '',
                password: '',
                role: '',
                status: 'Active',
            });
        } else {
            alert("Error al crear el usuario: " + createdUser.message);
        }
    };
    return (
        <div>
{/* main section */}
          <div className="">
   {/* buttons */}
<button
  className="border rounded-full p-1 border-blue-400 text-blue-500 transition-colors duration-200 w-10 h-10 flex items-center justify-center"
  onClick={() => setIsOpen(!isOpen)}
  type="button"
>
  {isOpen ? (
    <Minus className="w-5 h-5 text-red-500" />
  ) : (
    <Plus className="w-5 h-5 text-blue-500" />
  )}
</button>

            {/* form section */}
            <div className={`items-center justify-center mt-4 ${isOpen ? '' : 'hidden'}`}>
                <h3>Crear usuario</h3>
                <form className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-md font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={newUser.code}
                                onChange={(e) => setNewUser({ ...newUser, code: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:text-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-md font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:text-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-md font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:text-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-md font-medium text-gray-700">Rol</label>
                            <select
                                id="role"
                                name="role"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:text-md"
                            >
                                <option value="">Seleccione un rol</option>
                                <option value="Administrator">Administrador</option>
                                <option value="Standard">Estándar</option>
                            </select>
                        </div>
                        <button
  type="button"
  className="mt-4 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors duration-200"
  onClick={handleSubmit}
>
  Agregar Usuario
</button>
                    </div>
                </form>
            </div>
          </div>
    </div>
  )
}

export default AddUser