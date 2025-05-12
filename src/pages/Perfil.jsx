import React from 'react';

document.title = "Perfil";

function Perfil() {
  const users = [
    { id: 1, username: "AR065432", email: "user1@example.com" },
    { id: 2, username: "AR065433", email: "user2@example.com" },
    { id: 3, username: "AR065434", email: "user3@example.com" },
    { id: 4, username: "AR065435", email: "user4@example.com" },
    { id: 5, username: "AR065436", email: "user5@example.com" },
    { id: 6, username: "AR065437", email: "user6@example.com" },
    { id: 7, username: "AR065438", email: "user7@example.com" },
    { id: 8, username: "AR065439", email: "user8@example.com" },
    { id: 9, username: "AR065440", email: "user9@example.com" },
    { id: 10, username: "AR065441", email: "user10@example.com" },
    { id: 11, username: "AR065442", email: "user11@example.com" },
  ];
  const user1 = {
    username: "AR065432",
    password: "password123",
    role: "Standard",
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-start min-h-screen gap-6 p-4">
      {/* Información del usuario */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full md:max-w-md">
        <h1 className="text-2xl font-bold">
          Gestionar usuario {user1.role === "Standard" ? "Estándar" : "Administrador"}
        </h1>
        <img
          src="/user.jpg"
          alt="user image"
          width={180}
          className="rounded-full mt-5 mx-auto md:mx-0"
        />
        <p className="text-3xl mt-5 text-center md:text-left">{user1.username}</p>
      </div>

      {/* Formulario */}
      <form className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md">
        <div className="mt-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ingrese su contraseña"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ingrese su correo electrónico"
          />
        </div>
        {/* Tema */}
        <div className="flex flex-col mt-4">
          <p className="text-sm">Tema Predefinido</p>
          <div className="flex items-center mt-2">
            <label className="flex items-center mr-4">
              <input
                type="radio"
                name="theme"
                value="light"
                className="form-radio text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Claro</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                className="form-radio text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Oscuro</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Guardar
          </button>
        </div>
      </form>
      {/* final de usuario */}
          <div className="w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Gestionar usuarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-1 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between"
            >
              {/* Información del usuario */}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
      
              {/* Botones de acción */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(user.id)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Perfil;