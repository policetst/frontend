import { useState, useEffect } from 'react';
import { CircleUserRound, PencilLine } from 'lucide-react';
import { getUserRole, getUserDetails, getAllUsers, changeCredentials } from '../funcs/Users';
import AddUser from '../components/AddUser';
import { getEmailConfig, updateEmailConfig } from '../funcs/Config';

export default function GestionUsuarios() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    emailbrigada: ''
  });

  const [username, setUsername] = useState('');
  const [emailconfig, setEmailConfig] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userRole, setUserRole] = useState('Administrator');
  const [usuarios, setUsuarios] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false); // CORREGIDO typo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    if (!username) {
      console.error('Username no disponible');
      return;
    }

    try {
      const updatedUser = await changeCredentials(username, formData);
      console.log('User updated:', updatedUser);

      if (userRole === 'Administrator' && formData.emailbrigada) {
        await updateEmailConfig({ email: formData.emailbrigada });
      }

      alert("Credenciales actualizadas con éxito.");
      setShowUserForm(false);

    } catch (error) {
      console.error('Error updating user:', error);
      alert("Ocurrió un error al actualizar. Intenta nuevamente.");
    }
  };

  const fetchAllData = async () => {
    try {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername || 'Usuario');

      const details = await getUserDetails(storedUsername);
      setUserDetails(details);
      setFormData(prev => ({
        ...prev,
        email: details?.user?.email || ''
      }));

      const role = await getUserRole(storedUsername);
      if (role) {
        setUserRole(role);
      } else {
        console.warn('No se pudo obtener el rol del usuario');
      }

      const allUsers = await getAllUsers();
      setUsuarios(allUsers);

      const emailConfig = await getEmailConfig();
      setEmailConfig(emailConfig.data.brigade_field);
      setFormData(prev => ({
        ...prev,
        emailbrigada: emailConfig.data.brigade_field || ''
      }));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

        {/* Título */}
        <div className="block text-center xl:text-left">
          <h2 className="text-2xl font-bold">Gestión de usuario</h2>
          <hr className="border-t border-gray-300 my-4" />
        </div>

        {/* Tarjeta de usuario */}
        <div className="flex justify-center">
          <div className="
            w-full max-w-[356px] bg-white border border-gray-300 
            rounded px-4 py-3 shadow-sm hover:shadow-md transition gap-4
          ">
            <div className="flex flex-grow items-center gap-4">
              <CircleUserRound className='h-12 w-12 stroke-[1.8] text-gray-800' />
              <div className='flex flex-col'>
                <h3 className="text-lg font-semibold">{username}</h3>
                <hr className="border-t border-gray-300" />
                <span className="text-sm">
                  {userRole !== "Standard" ? "Administrador" : "Estándar"}
                </span>
              </div>
              <div className="ml-auto flex items-end">
                <button
                  type="button"
                  onClick={() => setShowUserForm((prev) => !prev)}
                  className={showUserForm
                    ? "text-gray-500 hover:text-gray-700 p-1 border"
                    : "text-blue-600 hover:text-blue-800"
                  }
                >
                  <PencilLine className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        {showUserForm && (
          <div className='flex justify-center'>
            <div className="
              w-full max-w-[356px] bg-white border border-gray-300 
              rounded shadow-sm hover:shadow-md transition gap-4 mt-5
            ">
              <form className="bg-white p-6 rounded-lg shadow-lg w-full md:max-w-md" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo de recuperación</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      id="email"
                      name="email"
                      className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                      placeholder="Correo de recuperación"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      id="password"
                      name="password"
                      className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                      placeholder="Contraseña"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                      placeholder="Confirmar contraseña"
                    />
                  </div>

                  {userRole === 'Administrator' && (
                    <div>
                      <label htmlFor="emailbrigada" className="block text-sm font-medium text-gray-700">Correo Brigada</label>
                      <input
                        type="email"
                        value={formData.emailbrigada}
                        onChange={handleChange}
                        id="emailbrigada"
                        name="emailbrigada"
                        className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                        placeholder="Correo electrónico brigada"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800 transition duration-200"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <hr className="border-t border-gray-300 my-8" />

        {/* Gestión de usuarios - Solo Administradores */}
        {userRole === 'Administrator' && (
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold pb-5">Gestionar usuarios</h2>
            </div>

            <div className='flex justify-center'>
              <AddUser
                userRole={userRole}
                usuarios={usuarios}
                refetchUsuarios={fetchAllData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
