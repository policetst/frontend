import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { PencilLine, CarFront, SwatchBook, Eye, EyeOff } from 'lucide-react';



function EditarVehiculo() {
  document.title = "SIL Tauste - Editar Vehiculo";
  
  const { license_plate } = useParams(); // obtener de la URL

  const [vehiculo, setVehiculo] = useState({
    license_plate: '',
    brand: '',
    model: '',
    color: ''
  });

//   Controles para editar vehiculo y mostar sus relaciones
  const [editable, setEditable] = useState(false);
  const [mostrarPersonasRelacionadas, setMostrarPersonasRelacionadas] = useState(false);
  const [mostrarVehiculosRelacionados, setMostrarVehiculosRelacionados] = useState(false);  

  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const response = await axios.get(`https://arbadev-back-joq0.onrender.com/vehicles/${license_plate}`);
        setVehiculo(response.data);
      } catch (error) {
        console.error('Error al obtener vehículo:', error);
      }
    };

    fetchVehiculo();
  }, [license_plate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/vehicles/${license_plate}`, vehiculo);
      Swal.fire('Vehículo actualizado', '', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el vehículo', 'error');
    }
  };



  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Título */}
          <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Editar Vehiculo</h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>
          <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Editar Vehiculo</h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>

          {/* Contenido */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Columna 1 */}
            <div className="flex-1 bg-gray-50 px-4 mb-1">

              {/* Tarjeta del vehículo */}
              <div className="flex justify-center">
                
                <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded px-4 py-3 shadow-sm hover:shadow-md transition gap-4">
                    <div className="flex flex-grow">
                    <div className="mb-flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{vehiculo.brand || 'Marca'}</h3>
                        <p className="text-sm text-gray-600 flex gap-1">
                        <span>{vehiculo.model || 'Modelo'}</span>
                        </p>
                    </div>

                    <div className="flex flex-col justify-center items-end flex-grow-0">
                        <button
                        type="button"
                        onClick={() => setEditable((prev) => !prev)}
                        className={`text-blue-600 hover:text-blue-800
                            ${editable 
                            ? "text-gray-500 hover:text-gray-700 p-1 border" 
                            : "text-blue-600 hover:text-blue-800"
                            }`}
                        >
                        <PencilLine className="w-4 h-4" />
                        </button>
                    </div>
                    
                    </div>
                    <hr className="border-t border-gray-300 my-2" />

                    <div className="flex justify-between">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <CarFront className="w-4 h-4 text-gray-600" />
                            <span>{vehiculo.license_plate || '---'}</span>
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                            <SwatchBook className="w-4 h-4 text-violet-700" />
                            <span>{vehiculo.color || '---'}</span>
                        </p>
                    </div>
                </div>
              </div>

              {/* Formulario oculto */}
                {editable && (
                <div>
                    <hr className="border-t border-gray-300 my-2 mt-6"/>
                    <h3 className="text-lg font-bold flex justify-center mt-3">Introducir cambios:</h3>
                    <p className="flex justify-center text-gray-700">La matrícula de un vehiculo no puede ser modificada</p>

                    {/* Contenedor que centra el formulario */}
                    <div className="flex justify-center my-4">
                    <form onSubmit={handleSubmit} className="w-[80%] max-w-[600px] space-y-4 bg-white p-4 rounded shadow-md">
                        <input
                        type="text"
                        value={vehiculo.brand}
                        onChange={(e) => setVehiculo({ ...vehiculo, brand: e.target.value })}
                        readOnly={!editable}
                        placeholder="Marca"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
                        />
                        <input
                        type="text"
                        value={vehiculo.model}
                        onChange={(e) => setVehiculo({ ...vehiculo, model: e.target.value })}
                        readOnly={!editable}
                        placeholder="Modelo"
                        className={`w-full p-2 border rounded ${editable ? '' : 'bg-gray-100'}`}
                        />
                        <input
                        type="text"
                        value={vehiculo.color}
                        onChange={(e) => setVehiculo({ ...vehiculo, color: e.target.value })}
                        readOnly={!editable}
                        placeholder="Color"
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
                            <ul>
                                <li className='text-sm text-gray-700'>
                                    nombre apellido1 apellido2 - INC12345
                                    {/* {p.first_name}, {p.last_name1}, {p.last_name2} – {p.code_incident}  */}
                                </li>
                            </ul>
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
                            <ul>
                                <li>
                                    <p>Marca Modelo Color - INC12345</p>
                                </li>
                                <li>
                                    <p>Marca Modelo Color - INC12345</p>
                                </li>
                                <li>
                                    <p>Marca Modelo Color - INC12345</p>
                                </li>
                                <li>
                                    <p>Marca Modelo Color - INC12345</p>
                                </li>
                            </ul>
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

export default EditarVehiculo;
