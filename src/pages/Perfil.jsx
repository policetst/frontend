import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { getUserRole, getUserDetails, getAllUsers, changeCredentials } from '../funcs/Users';
import AddUser from '../components/AddUser';

export default function GestionUsuarios() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    console.log('Submitting form with data:', formData);
    
    e.preventDefault();
    try {
      const updatedUser = await changeCredentials(username, formData);
      console.log('User updated:', updatedUser);
 if (updatedUser) {
        alert('Usuario actualizado correctamente');
      }
    else {
        alert('Error al actualizar el usuario: complete todos los campos');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('Standard');
  const [temaClaro, setTemaClaro] = useState(true);

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    setUsername(username || 'Usuario');

    const fetchUserRole = async () => {
      const role = await getUserRole(username);
      setUserRole(role || 'Standard');
    };
    fetchUserRole();

    const fetchUsuarios = async () => {
      const allUsers = await getAllUsers();
      setUsuarios(allUsers);
    };
    fetchUsuarios();
  }, []);
  console.log(usuarios);
  

  return (
    <div>
      {/* Titulo en escritorio o tablet */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold mt-4 ml-15 mb-10">Gestion de usuario</h2>
      </div>
      {/* Titulo en moviles */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold flex justify-center mb-10">Gestion de usuario</h2>
      </div>
      <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] p-6 space-y-8 text-gray-800">
        {/* Administrador */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold pb-5">Usuario {userRole !== "Standard" ? "Administrador" : "Estándar"}</h2>

          <div className="flex justify-center flex-wrap gap-6">
            {/* Avatar + ID */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 border-2 border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
              <span className="font-semibold mt-2">{username}</span>
            </div>

            {/* Formulario */}
            <form className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md" onSubmit={handleSubmit}>
              <div className="space-y-4">
               

                

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    id="password"
                    name="password"
                    className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Ingrese su contraseña"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Ingrese su correo electrónico"
                  />
                </div>

                {/* Tema & Brigada */}
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Tema Predefinido</p>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="light" className="form-radio text-indigo-600" />
                        <span className="ml-2 text-gray-700">Claro</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="dark" className="form-radio text-indigo-600" />
                        <span className="ml-2 text-gray-700">Oscuro</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>

        <hr />

        {/* Lista de usuarios */}
        <div className={`space-y-4 ${userRole === 'Administrator' ? 'mt-8' : 'hidden'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold pb-5">Gestionar usuarios</h2>
            <AddUser />
          </div>

          {/* Tarjetas de usuarios */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {usuarios.map((u, index) => (
              <div
                key={index}
                className={`flex justify-between items-center border rounded px-3 py-2 ${
                  u.status ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-full mt-1 rounded-sm ${
                      u.status ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                  ></div>
                  <div className="flex flex-col">
                    <span className={`font-bold ${!u.status && 'text-gray-400'}`}>{u.code}</span>
                    <span className="text-sm">{u.nombre} | {u.email}</span>
                  </div>
                </div>
               <Link to={`/edituser/${u.code}`} className="text-blue-500 hover:text-blue-700">
                 <Pencil className="w-4 h-4 text-blue-600 cursor-pointer" />
               </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}






























// import React from 'react';

// document.title = "Perfil";

// function Perfil() {
//   const users = [
//     { id: 1, username: "AR065432", email: "user1@example.com" },
//     { id: 2, username: "AR065433", email: "user2@example.com" },
//     { id: 3, username: "AR065434", email: "user3@example.com" },
//     { id: 4, username: "AR065435", email: "user4@example.com" },
//     { id: 5, username: "AR065436", email: "user5@example.com" },
//     { id: 6, username: "AR065437", email: "user6@example.com" },
//     { id: 7, username: "AR065438", email: "user7@example.com" },
//     { id: 8, username: "AR065439", email: "user8@example.com" },
//     { id: 9, username: "AR065440", email: "user9@example.com" },
//     { id: 10, username: "AR065441", email: "user10@example.com" },
//     { id: 11, username: "AR065442", email: "user11@example.com" },
//   ];
//   const user1 = {
//     username: "AR065432",
//     password: "password123",
//     role: "Standard",
//   };

//   return (
    




    // <div className="flex flex-col md:flex-row items-start justify-start min-h-screen gap-6 p-4">



    //   {/* Información del usuario */}
    //   <div className="bg-white p-8 rounded-lg shadow-lg w-full md:max-w-md">
    //     <h1 className="text-2xl font-bold">
    //       {/* Gestionar usuario {user1.role === "Standard" ? "Estándar" : "Administrador"} */}
    //       GESTIONAR USUARIO ADMINISTRADOR
    //     </h1>
    //     <img
    //       src="/user.jpg"
    //       alt="user image"
    //       width={180}
    //       className="rounded-full mt-5 mx-auto md:mx-0"
    //     />
    //     <p className="text-3xl mt-5 text-center md:text-left">{user1.username}</p>
    //   </div>

    //   {/* Formulario */}
      // <form className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md">
      //   <div className="mt-4">
      //     <label htmlFor="status" className="block text-sm font-medium text-gray-700">
      //       Estado
      //     </label>
      //     <select
      //       id="status"
      //       name="status"
      //       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      //     >
      //       <option value="active">Activo</option>
      //       <option value="inactive">Inactivo</option>
      //     </select>
      //   </div>
      //   <div className="mt-4">
      //     <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      //       Contraseña
      //     </label>
      //     <input
      //       type="password"
      //       id="password"
      //       name="password"
      //       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      //       placeholder="Ingrese su contraseña"
      //     />
      //   </div>
      //   <div className="mt-4">
      //     <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      //       Correo Electrónico
      //     </label>
      //     <input
      //       type="email"
      //       id="email"
      //       name="email"
      //       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      //       placeholder="Ingrese su correo electrónico"
      //     />
      //   </div>
      //   {/* Tema */}
      //   <div className="flex flex-col mt-4">
      //     <p className="text-sm">Tema Predefinido</p>
      //     <div className="flex items-center mt-2">
      //       <label className="flex items-center mr-4">
      //         <input
      //           type="radio"
      //           name="theme"
      //           value="light"
      //           className="form-radio text-indigo-600"
      //         />
      //         <span className="ml-2 text-gray-700">Claro</span>
      //       </label>
      //       <label className="flex items-center">
      //         <input
      //           type="radio"
      //           name="theme"
      //           value="dark"
      //           className="form-radio text-indigo-600"
      //         />
      //         <span className="ml-2 text-gray-700">Oscuro</span>
      //       </label>
      //     </div>
      //   </div>
      //   <div className="mt-4">
      //     <button
      //       type="submit"
      //       className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
      //     >
      //       Guardar
      //     </button>
      //   </div>
      // </form>
    //   {/* final de usuario */}
    //   <div className="w-full">
    //     <h2 className="text-lg font-bold text-gray-800 mb-4">GESTIONAR USUARIOS</h2>
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-1 gap-6">
    //       {users.map((user) => (
    //         <div
    //           key={user.id}
    //           className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between"
    //         >
    //           {/* Información del usuario */}
    //           <div>
    //             <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
    //             <p className="text-sm text-gray-600">{user.email}</p>
    //           </div>
      
    //           {/* Botones de acción */}
    //           <div className="flex gap-2 mt-4">
    //             <button
    //               onClick={() => handleEdit(user.id)}
    //               className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
    //             >
    //               Editar
    //             </button>
    //             <button
    //               onClick={() => handleDelete(user.id)}
    //               className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
    //             >
    //               Eliminar
    //             </button>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
//   );
// }

// export default Perfil;