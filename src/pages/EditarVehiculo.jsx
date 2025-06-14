import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PencilLine, CarFront, SwatchBook, Eye, EyeOff } from 'lucide-react';

const URL = import.meta.env.VITE_BASE_URL;

function EditarVehiculo() {
  const { license_plate } = useParams();

  const [vehiculo, setVehiculo] = useState({
    license_plate: '',
    brand: '',
    model: '',
    color: ''
  });

  const [editable, setEditable] = useState(false);
  const [mostrarIncidenciasRelacionadas, setMostrarIncidenciasRelacionadas] = useState(false);
  const [mostrarPersonasRelacionadas, setMostrarPersonasRelacionadas] = useState(false);
  const [mostrarVehiculosRelacionados, setMostrarVehiculosRelacionados] = useState(false);

  const [incidenciasRelacionadas, setIncidenciasRelacionadas] = useState([]);
  const [personasRelacionadas, setPersonasRelacionadas] = useState([]);
  const [vehiculosRelacionados, setVehiculosRelacionados] = useState([]);

  const [loadingIncidencias, setLoadingIncidencias] = useState(true);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [loadingVehiculo, setLoadingVehiculo] = useState(true);

  useEffect(() => {
    document.title = "SIL Tauste - Editar Vehículo";
  }, []);

  // Traer relaciones
  useEffect(() => {
    fetch(`${URL}/incident-vehicle/${license_plate}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setIncidenciasRelacionadas(data.data);
      })
      .catch(err => console.error('Error al cargar incidencias relacionadas:', err))
      .finally(() => setLoadingIncidencias(false));

    fetch(`${URL}/related-people/${license_plate}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setPersonasRelacionadas(data.data);
      })
      .catch(err => console.error('Error al cargar personas relacionadas:', err))
      .finally(() => setLoadingPersonas(false));

    fetch(`${URL}/related-vehicles/${license_plate}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setVehiculosRelacionados(data.data);
      })
      .catch(err => console.error('Error al cargar vehículos relacionados:', err))
      .finally(() => setLoadingVehiculos(false));
  }, [license_plate]);

  // Traer datos del vehículo
  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const response = await axios.get(`${URL}/vehicles/${license_plate}`);
        if (response.data.ok) {
          setVehiculo(response.data.data);
        } else {
          Swal.fire('No encontrado', response.data.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el vehículo', 'error');
        console.error(error);
      } finally {
        setLoadingVehiculo(false);
      }
    };

    fetchVehiculo();
  }, [license_plate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${URL}/vehicles/${license_plate}`, vehiculo);
      Swal.fire('Vehículo actualizado correctamente', '', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

        <div className="text-2xl font-bold text-center xl:text-left">Editar Vehículo</div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna 1 */}
          <div className="flex-1 bg-gray-50 px-4 mb-1">
            {/* Tarjeta */}
            <div className="flex justify-center">
              <div className="w-full max-w-[356px] bg-white border border-gray-300 rounded px-4 py-3 shadow-sm hover:shadow-md transition gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{vehiculo.brand || 'Marca'}</h3>
                    <p className="text-sm text-gray-600">{vehiculo.model || 'Modelo'}</p>
                  </div>
                  <button onClick={() => setEditable(prev => !prev)} className="text-blue-600 hover:text-blue-800">
                    <PencilLine className="w-4 h-4" />
                  </button>
                </div>
                <hr className="border-t border-gray-300 my-2" />
                <div className="flex justify-between text-sm text-gray-700">
                  <p className="flex items-center gap-2"><CarFront className="w-4 h-4" />{vehiculo.license_plate}</p>
                  <p className="flex items-center gap-2"><SwatchBook className="w-4 h-4 text-violet-700" />{vehiculo.color}</p>
                </div>
              </div>
            </div>

            {/* Formulario editable */}
            {editable && (
              <div className="mt-6">
                <hr className="border-t border-gray-300 my-4" />
                <h3 className="text-lg font-bold text-center">Introducir cambios:</h3>
                <p className="text-center text-gray-700">La matrícula no puede modificarse</p>
                <div className="flex justify-center my-4">
                  <form onSubmit={handleSubmit} className="w-[80%] max-w-[600px] space-y-4 bg-white p-4 rounded shadow-md">
                    <label>Marca:</label>
                    <input
                      type="text"
                      value={vehiculo.brand}
                      onChange={(e) => setVehiculo({ ...vehiculo, brand: e.target.value })}
                      placeholder="Marca"
                      className="w-full p-2 border border-gray-400 rounded"
                    />
                    <label>Modelo:</label>
                    <input
                      type="text"
                      value={vehiculo.model}
                      onChange={(e) => setVehiculo({ ...vehiculo, model: e.target.value })}
                      placeholder="Modelo"
                      className="w-full p-2 border border-gray-400 rounded"
                    />
                    <label>Color:</label>
                    <input
                      type="text"
                      value={vehiculo.color}
                      onChange={(e) => setVehiculo({ ...vehiculo, color: e.target.value })}
                      placeholder="Color"
                      className="w-full p-2 border border-gray-400 rounded"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Guardar cambios
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Columna 2 */}
          <div className="flex-1 bg-gray-50 px-4">

            {/* Incidencias relacionadas */}
            <RelacionBox
              title="Incidencias relacionadas"
              isOpen={mostrarIncidenciasRelacionadas}
              onToggle={() => setMostrarIncidenciasRelacionadas(prev => !prev)}
              loading={loadingIncidencias}
              data={incidenciasRelacionadas}
              type="incidencia"
            />

            {/* Personas relacionadas */}
            <RelacionBox
              title="Personas relacionadas"
              isOpen={mostrarPersonasRelacionadas}
              onToggle={() => setMostrarPersonasRelacionadas(prev => !prev)}
              loading={loadingPersonas}
              data={personasRelacionadas}
              type="persona"
            />

            {/* Vehículos relacionados */}
            <RelacionBox
              title="Vehículos relacionados"
              isOpen={mostrarVehiculosRelacionados}
              onToggle={() => setMostrarVehiculosRelacionados(prev => !prev)}
              loading={loadingVehiculos}
              data={vehiculosRelacionados}
              type="vehiculo"
            />

          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente para mostrar bloques de relaciones
function RelacionBox({ title, isOpen, onToggle, loading, data, type }) {
  return (
    <div className="border border-gray-300 border-sm rounded my-4">
      <div className="flex justify-between px-5 pt-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <button type="button" onClick={onToggle} className="text-blue-600 hover:text-blue-700">
          {isOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <hr className="border-t border-gray-300 mt-2" />
      {isOpen && (
        <div className="flex justify-center py-5">
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500 italic">No hay resultados</p>
          ) : (
            <ul className="space-y-2">
              {data.map((item, idx) => {
                if (type === 'persona') {
                  return (
                    <li key={idx} className="border p-2 rounded shadow-sm">
                      {item.first_name} {item.last_name1} (<Link to={`/editarpersona/${item.dni}`} className="text-blue-600 hover:text-blue-700">{item.dni}</Link>) - Incidencia: <Link to={`/editincident/${item.incident_code}`} className="text-blue-600 hover:text-blue-700">{item.incident_code}</Link>
                    </li>
                  );
                } else if (type === 'vehiculo') {
                  return (
                    <li key={idx} className="border p-2 rounded shadow-sm">
                      {item.brand} {item.model} (<Link to={`/editarvehiculo/${item.license_plate}`} className="text-blue-600 hover:text-blue-700">{item.license_plate}</Link>) - Incidencia: <Link to={`/editincident/${item.incident_code}`} className="text-blue-600 hover:text-blue-700">{item.incident_code}</Link>
                    </li>
                  );
                } else {
                  return (
                    <li key={idx} className="border p-2 rounded shadow-sm">
                       <Link to={`/editincident/${item.incident_code}`} className="text-blue-600 hover:text-blue-700">{item.incident_code}</Link>
                    </li>
                  );
                }
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default EditarVehiculo;
