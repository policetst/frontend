import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetails, updateUserDetails } from '../funcs/Users';
import Swal from 'sweetalert2';

function EditUser() {
  useEffect(() => {
        document.title = "SIL Tauste - Editar Usuario";
  }, []);

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
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">
          <div className="block text-center xl:text-left">
            <h2 className="text-2xl font-bold">Editar usuario: <span className='font-medium'>{code}</span></h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>
          <div className="flex justify-center">
            <form className="bg-white p-6 rounded border border-gray-300 shadow-lg w-full md:max-w-md" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    onChange={handleChange}
                    value={formData.status}
                    id="status"
                    name="status"
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  >
                    <option value="Active">Activo</option>
                    <option value="Inactive">Inactivo</option>
                  </select>
                </div>

                {/* Rol */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    onChange={handleChange}
                    value={formData.role}
                    id="role"
                    name="role"
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                  >
                    <option value="Administrator">Administrador</option>
                    <option value="Standard">Estándar</option>
                  </select>
                </div>

                {/* Contraseña */}
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
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                    placeholder="Contraseña"
                    autoComplete="new-password"
                  />
                </div>

                {/* Repetir contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                    placeholder="Repite contraseña"
                    autoComplete="new-password"
                  />
                </div>

                  {/* Correo de recuperación */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo de recuperación
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      id="email"
                      name="email"
                      className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                      placeholder="correoderecuperacion@dominio.ex"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 mt-3 rounded hover:bg-blue-700 transition duration-200"
                  >
                    Guardar
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default EditUser;
