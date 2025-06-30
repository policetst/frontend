import React, { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createUser } from '../funcs/Users';

import Swal from 'sweetalert2';

function AddUser({ userRole, usuarios = [], refetchUsuarios }) {
  const [newUser, setNewUser] = useState({
    code: '',
    email: '',
    password: '',
    role: '',
    status: 'Active',
    nombre: '',
  });

  const [showList, setShowList] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newUser.code || !newUser.email || !newUser.password || !newUser.role || !newUser.nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Creando usuario...',
        text: 'Por favor espera mientras se procesa la información',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const createdUser = await createUser(newUser);
      console.log("New User Data:", createdUser);

      if (createdUser && createdUser.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: 'El usuario ha sido creado correctamente.',
          confirmButtonText: 'Perfecto',
          confirmButtonColor: '#28a745'
        });
        setNewUser({
          code: '',
          email: '',
          password: '',
          role: '',
          status: 'Active',
          nombre: '',
        });

        if (typeof refetchUsuarios === 'function') {
          refetchUsuarios(); // Recargar lista desde el padre
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: createdUser?.message || 'Ha ocurrido un error inesperado',
          confirmButtonText: 'Intentar de nuevo',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  return (
    <div className='w-80 lg:w-356'>
      {/* Botones de conmutacion */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          className={`flex items-center gap-2 px-6 py-2 rounded-md border transition ${
            showList ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => {
            setShowList(true);
          }}
        >
          Mostrar agentes
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
            !showList ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => {
            setShowList(false);
          }}
        >
          Crear nuevo agente
        </button>
      </div>

      {/* Lista de usuarios */}
      {showList && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {usuarios.map((u, index) => (
              <div
                key={index}
                className={`flex justify-between items-center text-gray-800 border border-gray-300 rounded px-3 py-2 ${
                  u.status === 'Active' ? 'bg-white text-black' : 'bg-gray-300 text-white border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-full mt-1 rounded ${u.status === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div className="flex flex-col">
                    <span className="font-bold">{u.code}</span>
                    <span className="text-sm truncate max-w-[140px]">{u.email}</span>
                  </div>
                </div>
                <Link to={`/edituser/${u.code}`} className={`text-blue-500 hover:text-blue-700 ${
                  u.status === 'Active' ? 'text-blue-500 hover:text-blue-700' : 'text-white hover:text-cyan-100'
                }`}>
                  <PencilLine className="mr-3 w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar usuario */}
      {!showList && (
        <div className='flex justify-center'>
          <div className="w-full max-w-[356px] bg-white border border-gray-300 
                rounded shadow-sm hover:shadow-md transition gap-4 mt-5">
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  placeholder='Contraseña'
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                className="mt-4 py-2 w-full bg-blue-600 text-white rounded hover:bg-blue-800 transition duration-200"
              >
                Crear usuario
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddUser;
