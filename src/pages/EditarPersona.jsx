import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const URL = import.meta.env.VITE_BASE_URL; // Asegúrate de que esta variable esté definida en tu .env
import Swal from 'sweetalert2';
import { PencilLine, IdCard, Phone, Eye, EyeOff } from 'lucide-react';


function EditarPersona() {
  document.title = "SIL Tauste - Editar Persona";
  
  const { dni } = useParams(); // obtener de la URL

  const [persona, setPersona] = useState({
    dni: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    phone_number: ''
  });

//   Controles para editar vehiculo y mostar sus relaciones
  const [editable, setEditable] = useState(false);
  const [mostrarPersonasRelacionadas, setMostrarPersonasRelacionadas] = useState(false);
  const [mostrarVehiculosRelacionados, setMostrarVehiculosRelacionados] = useState(false);  

  const [personasRelacionadas, setPersonasRelacionadas] = useState([]);
  const [vehiculosRelacionados, setVehiculosRelacionados] = useState([]);

  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);

  //   Relaciones 
    useEffect(() => {
    // Fetch personas relacionadas
    fetch(`${URL}/related-people/${dni}`)
        .then(res => res.json())
        .then(data => {
        if (data.ok) setPersonasRelacionadas(data.data);
        })
        .catch(err => console.error('Error personas:', err))
        .finally(() => setLoadingPersonas(false));

    // Fetch vehículos relacionados
    fetch(`${URL}/related-vehicles/${dni}`)
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
        const response = await axios.get(`${URL}/people/${dni}`);
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
      await axios.put(`${URL}/people/${dni}`, persona);
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
                        <input
                        type="text"
                        value={persona.first_name}
                        onChange={(e) => setPersona({ ...persona, first_name: e.target.value })}
                        readOnly={!editable}
                        placeholder="Nombre"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
                        />
                        <input
                        type="text"
                        value={persona.last_name1}
                        onChange={(e) => setPersona({ ...persona, last_name1: e.target.value })}
                        readOnly={!editable}
                        placeholder="Apellido 1"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
                        />
                        <input
                        type="text"
                        value={persona.last_name2}
                        onChange={(e) => setPersona({ ...persona, last_name2: e.target.value })}
                        readOnly={!editable}
                        placeholder="Apellido 2"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
                        />
                        <input
                        type="text"
                        value={persona.phone_number}
                        onChange={(e) => setPersona({ ...persona, phone_number: e.target.value })}
                        readOnly={!editable}
                        placeholder="Número de contacto"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
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
                                    {p.first_name} {p.last_name1} ({p.dni}) - {p.incident_code}
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
                                    {v.brand} {v.model} ({v.license_plate}) - Incidencia: {v.incident_code}
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

export default EditarPersona
