import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetails, updateUserDetails } from '../funcs/Users';
import Swal from 'sweetalert2';

function EditUser() {
  const navigate = useNavigate();
  const { code } = useParams();
  console.log('Editing user with code:', code);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Atención! Esta acción actualizará los datos del usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire('Actualizado', 'Los datos del usuario han sido actualizados.', 'success');
      }
    });
    // alert('¡Atención! Esta acción actualizará los datos del usuario.');
  
    console.log('Submitting form with data:', formData);
    try {
      const updated = await updateUserDetails(code, formData);
      console.log('User updated:', updated);
      navigate(`/perfil`);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserDetails(code);
        console.log('Fetched user data:', data);

        if (data && data.user) {
          setFormData({
            email: data.user.email || '',
            password: '',
            role: data.user.role || '',
            status: data.user.status || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
      }
    };

    if (code) fetchUserData();
  }, [code]);



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md"
        onSubmit={handleSubmit}
      >
        <span className="font-semibold mt-2 text-gray-700 underline block mb-2">
          Código: {code}
        </span>
        <div className="space-y-4">
          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-md font-medium text-gray-700">
              Estado
            </label>
            <select
              onChange={handleChange}
              value={formData.status}
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:text-md"
            >
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>
          </div>

            {/* Rol */}
            <div>
            <label htmlFor="role" className="block text-md font-medium text-gray-700">
              Rol
            </label>
            <select
              onChange={handleChange}
              value={formData.role}
              id="role"
              name="role"
              className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:text-md"
            >
              <option value="Administrator">Administrador</option>
              <option value="Standard">Estándar</option>
            </select>
            </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="contraseña"
              autoComplete="new-password"
            />
          </div>

          {/* Correo */}
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
              placeholder="correo electrónico"
            />
          </div>

          {/* Tema & Brigada (esto NO se guarda porque no está en formData, ojo) */}
          <div className="flex justify-between">
        
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
  );
}

export default EditUser;
