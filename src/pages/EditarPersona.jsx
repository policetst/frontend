import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
const URL = import.meta.env.VITE_BASE_URL;
import Swal from 'sweetalert2';
import { PencilLine, IdCard, Phone, Eye, EyeOff } from 'lucide-react';

// Importa tu función de token, ajusta la ruta según tu proyecto
import { getTokenFromCookie } from '../funcs/Incidents.jsx';

function EditarPersona() {
  document.title = "SIL Tauste - Editar Persona";
  
  const { dni } = useParams();

  const [persona, setPersona] = useState({
    dni: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    phone_number: ''
  });

  const [editable, setEditable] = useState(false);
  const [mostrarIncidenciasRelacionadas, setMostrarIncidenciasRelacionadas] = useState(false);  
  const [mostrarPersonasRelacionadas, setMostrarPersonasRelacionadas] = useState(false);
  const [mostrarVehiculosRelacionados, setMostrarVehiculosRelacionados] = useState(false);  

  const [incidenciasRelacionadas, setIncidenciasRelacionadas] = useState([]);
  const [personasRelacionadas, setPersonasRelacionadas] = useState([]);
  const [vehiculosRelacionados, setVehiculosRelacionados] = useState([]);

  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [loading, setLoading] = useState(true);

  // Relaciones 
  useEffect(() => {
    // Incidencias relacionadas 
    fetch(`${URL}/incident-person/${dni}`, {
      headers: {
        'Authorization': 'Bearer ' + getTokenFromCookie()
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setIncidenciasRelacionadas(data.data);
      })
      .catch(err => console.error('Error incidencias de persona:', err))
      .finally(() => setLoadingPersonas(false));

    // Personas relacionadas
    fetch(`${URL}/related-peoplep/${dni}`, {
      headers: {
        'Authorization': 'Bearer ' + getTokenFromCookie()
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setPersonasRelacionadas(data.data);
      })
      .catch(err => console.error('Error personas:', err))
      .finally(() => setLoadingPersonas(false));

    // Vehículos relacionados
    fetch(`${URL}/related-vehiclesp/${dni}`, {
      headers: {
        'Authorization': 'Bearer ' + getTokenFromCookie()
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setVehiculosRelacionados(data.data);
      })
      .catch(err => console.error('Error vehículos:', err))
      .finally(() => setLoadingVehiculos(false));
  }, [dni]);

  // Traer a la persona para editar
  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const response = await axios.get(`${URL}/people/${dni}`, {
          headers: {
            'Authorization': 'Bearer ' + getTokenFromCookie()
          }
        });
        if (response.data.ok) {
          setPersona(response.data.data);
        } else {
          Swal.fire('No encontrado', response.data.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo cargar la persona', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [dni]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const phoneRegex = /^(\+34|0034)?[\s\-]?([6|7|8|9]{1}[0-9]{2})[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}$/;
      if (!phoneRegex.test(persona.phone_number)) {
        Swal.fire({
          icon: 'warning',
          title: 'Teléfono inválido',
          text: 'Introduce un número de teléfono válido.',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      await axios.put(`${URL}/people/${dni}`, persona, {
        headers: {
          'Authorization': 'Bearer ' + getTokenFromCookie()
        }
      });
      Swal.fire('Persona actualizada correctamente', '', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Título */}
          <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Editar Persona</h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>
          <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Editar Persona</h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>

          {/* Contenido */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Columna 1 */}
            <div className="flex-1 bg-gray-50 px-4 mb-1">

              {/* Tarjeta de la persona */}
              <div className="flex justify-center">
                
                <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded px-4 py-3 shadow-sm hover:shadow-md transition gap-4">
                    <div className="flex flex-grow">
                    <div className="mb-flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{persona.first_name || 'Nombre'}</h3>
                        <p className="text-sm text-gray-600 flex gap-1">
                        <span>{persona.last_name1 || 'Apellido1'}</span>
                        <span>{persona.last_name2 || 'Apellido2'}</span>
                        </p>
                    </div>

                    <div className="flex flex-col justify-center items-end flex-grow-0">
                        <button
                        type="button"
                        onClick={() => setEditable((prev) => !prev)}
                        className={editable 
                            ? "text-gray-500 hover:text-gray-700 p-1 border" 
                            : "text-blue-600 hover:text-blue-800"
                            }
                        >
                        <PencilLine className="w-4 h-4" />
                        </button>
                    </div>
                    
                    </div>
                    <hr className="border-t border-gray-300 my-2" />

                    <div className="flex justify-between">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>{persona.phone_number || '---'}</span>
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <IdCard className="w-4 h-4 text-gray-600" />
                            <span>{persona.dni || '---'}</span>
                        </p>
                    </div>
                </div>
              </div>

              {/* Formulario oculto */}
                {editable && (
                <div>
                    <hr className="border-t border-gray-300 my-2 mt-6"/>
                    <h3 className="text-lg font-bold flex justify-center mt-3">Introducir cambios:</h3>
                    <p className="flex justify-center text-gray-700">El DNI o NIE de una persona no puede ser modificado</p>

                    {/* Contenedor que centra el formulario */}
                    <div className="flex justify-center my-4">
                    <form onSubmit={handleSubmit} className="w-[80%] max-w-[600px] space-y-4 bg-white p-4 rounded shadow-md">
                      <label>Nombre:</label>
                      <input
                      type="text"
                      value={persona.first_name}
                      onChange={(e) => setPersona({ ...persona, first_name: e.target.value })}
                      readOnly={!editable}
                      placeholder="Nombre"
                      className={`w-full p-2 border border-gray-400 rounded ${editable ? '' : 'bg-gray-100'}`}
                      />
                      <label>Primer apellido:</label>
                      <input
                      type="text"
                      value={persona.last_name1}
                      onChange={(e) => setPersona({ ...persona, last_name1: e.target.value })}
                      readOnly={!editable}
                      placeholder="Apellido 1"
                      className={`w-full p-2 border border-gray-400 rounded ${editable ? '' : 'bg-gray-100'}`}
                      />
                      <label>Segundo apellido:</label>
                      <input
                      type="text"
                      value={persona.last_name2}
                      onChange={(e) => setPersona({ ...persona, last_name2: e.target.value })}
                      readOnly={!editable}
                      placeholder="Apellido 2"
                      className={`w-full p-2 border border-gray-400 rounded ${editable ? '' : 'bg-gray-100'}`}
                      />
                      <label>Teléfono de contacto:</label>
                      <input
                      type="text"
                      value={persona.phone_number}
                      onChange={(e) => setPersona({ ...persona, phone_number: e.target.value })}
                      readOnly={!editable}
                      placeholder="Número de contacto"
                      className={`w-full p-2 border border-gray-400 rounded ${editable ? '' : 'bg-gray-100'}`}
                      />
                      <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                      Guardar cambios
                      </button>
                    </form>
                    </div>
                </div>
                )}

            </div>

            {/* Columna 2 */}
            <div className="flex-1 bg-gray-50 px-4">
              {/* Mostrar incidencias relacionadas */}
                <div className="border border-gray-300 border-sm rounded mb-4">
                    <div className="flex justify-between px-5 pt-2">
                        <h3 className="text-lg font-bold">Incidencias relacionadas</h3>
                        <button
                            type="button"
                            onClick={() => setMostrarIncidenciasRelacionadas((prev) => !prev)}
                            className="text-blue-600 hover:text-blue-700"
                            >
                            {mostrarIncidenciasRelacionadas 
                                ? <EyeOff className="w-4 h-4" />
                                : <Eye className="w-4 h-4" />
                            }
                        </button>
                        
                    </div>
                    <hr className="border-t border-gray-300 mt-2"/>
                    {mostrarIncidenciasRelacionadas && (
                        <div className="flex justify-center py-5">
                            {loadingPersonas ? (
                                <p className="text-gray-500">Cargando incidencias...</p>
                            ) : incidenciasRelacionadas.length === 0 ? (
                                <p className="text-gray-500 italic">No hay incidencias relacionadas</p>
                            ) : (
                                <ul className="space-y-2">
                                {incidenciasRelacionadas.map((p, idx) => (
                                    <li key={idx} className="border p-2 rounded shadow-sm">
                                     <Link to={`/editincident/${p.incident_code}`} className='text-blue-600 hover:text-blue-700'>{p.incident_code}</Link> 
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                {/* Mostrar personas relacionadas */}
                <div className="border border-gray-300 border-sm rounded ">
                    <div className="flex justify-between px-5 pt-2">
                        <h3 className="text-lg font-bold">Personas relacionadas</h3>
                        <button
                            type="button"
                            onClick={() => setMostrarPersonasRelacionadas((prev) => !prev)}
                            className="text-blue-600 hover:text-blue-700"
                            >
                            {mostrarPersonasRelacionadas 
                                ? <EyeOff className="w-4 h-4" />
                                : <Eye className="w-4 h-4" />
                            }
                        </button>
                        
                    </div>
                    <hr className="border-t border-gray-300 mt-2"/>
                    {mostrarPersonasRelacionadas && (
                        <div className="flex justify-center py-5">
                            {loadingPersonas ? (
                                <p className="text-gray-500">Cargando personas...</p>
                            ) : personasRelacionadas.length === 0 ? (
                                <p className="text-gray-500 italic">No hay personas relacionadas</p>
                            ) : (
                                <ul className="space-y-2">
                                {personasRelacionadas.map((p, idx) => (
                                    <li key={idx} className="border p-2 rounded shadow-sm">
                                    {p.first_name} {p.last_name1} ({<Link to={`/editarpersona/${p.dni}`} className='text-blue-600 hover:text-blue-700'>{p.dni}</Link>}) - <Link to={`/editincident/${p.incident_code}`} className='text-blue-600 hover:text-blue-700'>{p.incident_code}</Link>
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                {/* Mostrar vehiculos relacionados */}
                <div className="border border-gray-300 border-sm rounded mt-4 mb-6">
                    <div className="flex justify-between px-5 pt-2">
                        <h3 className="text-lg font-bold">Vehiculos relacionados</h3>
                        <button
                            type="button"
                            onClick={() => setMostrarVehiculosRelacionados((prev) => !prev)}
                            className="text-blue-600 hover:text-blue-700"
                            >
                            {mostrarVehiculosRelacionados 
                                ? <EyeOff className="w-4 h-4" />
                                : <Eye className="w-4 h-4" />
                            }
                        </button>
                    </div>
                    <hr className="border-t border-gray-300 mt-2"/>
                    {mostrarVehiculosRelacionados && (
                        <div className="flex justify-center p-5">
                            {loadingVehiculos ? (
                                <p className="text-gray-500">Cargando vehículos...</p>
                            ) : vehiculosRelacionados.length === 0 ? (
                                <p className="text-gray-500 italic">No hay vehículos relacionados</p>
                            ) : (
                                <ul className="space-y-2">
                                {vehiculosRelacionados.map((v, idx) => (
                                    <li key={idx} className="border p-2 rounded shadow-sm">
                                    {v.brand} {v.model} ({<Link to={`/editarvehiculo/${v.license_plate}`} className='text-blue-600 hover:text-blue-700'>{v.license_plate}</Link>}) - Incidencia: <Link to={`/editincident/${v.incident_code}`} className='text-blue-600 hover:text-blue-700'>{v.incident_code}</Link>
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarPersona;
