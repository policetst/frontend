import { useState, useEffect } from 'react';
import { CircleUserRound, PencilLine, Eye,EyeOff } from 'lucide-react';
import { getUserRole, getUserDetails, getAllUsers, changeCredentials } from '../funcs/Users';
import AddUser from '../components/AddUser';
import { getEmailConfig, updateEmailConfig } from '../funcs/Config';
import Swal from 'sweetalert2';

export default function GestionUsuarios() {
  useEffect(() => {
    document.title = "SIL Tauste - Gestion de usuario";
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmpassword: '',
    emailbrigada: ''
  });

  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailconfig, setEmailConfig] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [showUserForm, setShowUserForm] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmpassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Aviso',
        text: `Completa todos los campos`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (!username) {
      console.error('Username no disponible');
      return;
    }

    if (formData.password !== formData.confirmpassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseñas no coinciden',
        text: 'Las contraseñas introducidas no son iguales. Por favor, verifica que ambas contraseñas sean idénticas.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    try {
      const updatedUser = await changeCredentials(username, formData);
      console.log('User updated:', updatedUser);

      if (userRole === 'Administrator' && formData.emailbrigada) {
        await updateEmailConfig({ email: formData.emailbrigada });
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Credenciales actualizadas.`,
        confirmButtonText: 'Aceptar'
      });
      setShowUserForm(false);

    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: `Ocurrió un error al actualizar`,
        confirmButtonText: 'Aceptar'
      });
      return;
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
      setUserRole(role || 'Standard');

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

// Animación de carga
  if (userRole === null) {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col items-center mt-15 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-8 border-blue-600 border-t-transparent opacity-80"></div>
          <p className="text-gray-600 text-sm">Cargando datos de usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">
        {/* Título */}
        <div className="block text-center xl:text-left">
          <h2 className="text-2xl font-bold">Gestión de usuario</h2>
          <hr className="border-t border-gray-300 my-4" />
        </div>
        
        {/* Estructura principal */}
        <div className='grid sm:grid-cols-2 gap-4'>
          {/* Columna 1 */}
          <div>
            {/* Tarjeta de usuario */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded px-4 py-3 shadow-sm hover:shadow-md transition gap-4">
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
                        : "text-blue-600 hover:text-blue-800"}
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
                <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition gap-4 mt-1">
                  <form className="bg-white p-4 rounded-lg shadow-lg w-full md:max-w-md" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <h3 className="text-lg">Editar usuario: {username}</h3>
                      </div>
                      <hr className="border-t border-gray-300 pb-4" />
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Correo de recuperación
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="correoderecuperacion@dominio.ex"
                          id="email"
                          name="email"
                          className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            id="password"
                            name="password"
                            className="w-full p-2 pr-10 border border-gray-200 rounded bg-gray-50"
                            placeholder="Contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">
                          Confirmar contraseña
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmpassword}
                          onChange={handleChange}
                          id="confirmpassword"
                          name="confirmpassword"
                          className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                          placeholder="Confirmar contraseña"
                        />
                      </div>
                      {userRole === 'Administrator' && (
                        <div>
                          <label htmlFor="emailbrigada" className="block text-sm font-medium text-gray-700">
                            Correo Brigada
                          </label>
                          <input
                            type="email"
                            value={formData.emailbrigada}
                            onChange={handleChange}
                            id="emailbrigada"
                            name="emailbrigada"
                            className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                            placeholder="correodebrigada@dominio.ex"
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
          </div>

          {/* Columna 2 */}
          <div>
            {/* Gestión de usuarios - Solo Administradores */}
            {userRole === 'Administrator' && (
              <div className="space-y-4 w-full">
                <div className="text-center mt-15 md:mt-0">
                  <h3 className="text-xl font-semibold">Gestionar usuarios</h3>
                  <hr className="block md:hidden border-t border-gray-300 my-6" />
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
      </div>
    </div>
  );
}