import React, { useState } from 'react';
import { PencilLine, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createUser } from '../funcs/Users';

function AddUser({ userRole, usuarios = [], refetchUsuarios }) {
  const [newUser, setNewUser] = useState({
    code: '',
    email: '',
    password: '',
    role: '',
    status: 'Active',
    nombre: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { code, email, password, role, nombre } = newUser;

    if (!code || !email || !password || !role || !nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan campos',
        text: 'Por favor, completa todos los campos.'
      });
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.'
      });
      return;
    }

    try {
      const createdUser = await createUser(newUser);

      if (createdUser.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'Usuario creado correctamente.'
        });
        setNewUser({
          code: '',
          email: '',
          password: '',
          role: '',
          status: 'Active',
          nombre: '',
        });
        setConfirmPassword('');
        setShowForm(false);

        if (typeof refetchUsuarios === 'function') {
          refetchUsuarios();
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear el usuario: ' + createdUser.message
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Intenta nuevamente.'
      });
    }
  };

  return (
    <div className='w-356'>
      {/* Botones */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
            showForm ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => {
            setShowForm(true);
            setShowList(false);
          }}
        >
          Crear nuevo agente
        </button>

        <button
          type="button"
          className={`flex items-center gap-2 px-6 py-2 rounded-md border transition ${
            showList ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => {
            setShowList(true);
            setShowForm(false);
          }}
        >
          Mostrar agentes
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className='flex justify-center'>
          <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition gap-4 mt-5">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
                  <input
                    type="text"
                    id="code"
                    value={newUser.code}
                    placeholder='AR54321'
                    onChange={(e) => setNewUser({ ...newUser, code: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    value={newUser.nombre}
                    placeholder='Nombre'
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo de recuperación</label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    placeholder='correoderecuperacion@dominio.ex'
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  />
                </div>

                {/* Contraseña y confirmar contraseña con solo un ojo */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      id="password"
                      value={newUser.password}
                      placeholder='Contraseña'
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded bg-gray-50 pr-10"
                    />
                    <span
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-2 top-2 cursor-pointer text-gray-500"
                      tabIndex={0}
                      aria-label={showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    placeholder='Repite la contraseña'
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="Administrator">Administrador</option>
                    <option value="Standard">Estándar</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800 transition duration-200"
                >
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {showList && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((u, index) => (
              <div
                key={index}
                className={`flex justify-between items-center border rounded px-3 py-2 ${
                  u.status === 'Active' ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-full mt-1 rounded ${u.status === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div className="flex flex-col">
                    <span className="font-bold">{u.code}</span>
                    <span className="text-sm">{u.email}</span>
                  </div>
                </div>
                <Link to={`/edituser/${u.code}`} className="text-blue-500 hover:text-blue-700">
                  <PencilLine className="mr-3 w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddUser;
