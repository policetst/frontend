import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { code, email, password, role, nombre } = newUser;

    if (!code || !email || !password || !role || !nombre) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const createdUser = await createUser(newUser);
      console.log("New User Data:", createdUser);

      if (createdUser.ok) {
        alert("Usuario creado correctamente.");
        setNewUser({
          code: '',
          email: '',
          password: '',
          role: '',
          status: 'Active',
          nombre: '',
        });
        setShowForm(false);

        if (typeof refetchUsuarios === 'function') {
          refetchUsuarios(); // Recargar lista desde el padre
        }
      } else {
        alert("Error al crear el usuario: " + createdUser.message);
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      alert("Error inesperado. Intenta nuevamente.");
    }
  };

  return (
    <div className="p-4">
      {/* Botones */}
      <div className="flex justify-center gap-4 mt-6">
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
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
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
        <div className="items-center justify-center mt-6">
          <h3 className="text-lg font-semibold mb-2">Crear usuario</h3>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md mx-auto"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-md font-medium text-gray-700">Código</label>
                <input
                  type="text"
                  id="code"
                  value={newUser.code}
                  onChange={(e) => setNewUser({ ...newUser, code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-md font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-md font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-md font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-md font-medium text-gray-700">Rol</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="">Seleccione un rol</option>
                  <option value="Administrator">Administrador</option>
                  <option value="Standard">Estándar</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition"
              >
                Agregar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {showList && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {usuarios.map((u, index) => (
              <div
                key={index}
                className={`flex justify-between items-center border rounded px-3 py-2 ${
                  u.status === 'Active' ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-full mt-1 rounded-sm ${u.status === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div className="flex flex-col">
                    <span className="font-bold">{u.code}</span>
                    <span className="text-sm">{u.nombre || 'Sin nombre'} | {u.email}</span>
                  </div>
                </div>
                <Link to={`/edituser/${u.code}`} className="text-blue-500 hover:text-blue-700">
                  <Pencil className="w-4 h-4" />
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
