import React, { useState, useEffect, useRef } from 'react';
import { updateIncident } from '../funcs/Incidents';
import Swal from 'sweetalert2';

const EditIncidentModal = ({ 
  showModal, 
  setShowModal, 
  incident, 
  incidentDetails, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    type: '',
    description: '',
    people: [],
    vehicles: [],
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalFormData = useRef(null);

  // For handling new people/vehicles
  const [newPerson, setNewPerson] = useState({ dni: '', name: '', phone: '' });
  const [newVehicle, setNewVehicle] = useState({ matricula: '', model: '', color: '' });

  useEffect(() => {
    if (incidentDetails && incidentDetails.ok) {
      const fullData = {
        status: incidentDetails.incident.status || '',
        location: incidentDetails.incident.location || '',
        type: incidentDetails.incident.type || '',
        description: incidentDetails.incident.description || '',
        people: incidentDetails.people || [],
        vehicles: incidentDetails.vehicles || [],
        images: incidentDetails.images?.map(img => img.url) || []
      };
      
      setFormData(fullData);
      originalFormData.current = JSON.parse(JSON.stringify(fullData)); // Deep copy for comparison
    }
  }, [incidentDetails]);

  // Track unsaved changes
  useEffect(() => {
    if (originalFormData.current) {
      const isEqual = 
        JSON.stringify(originalFormData.current) === JSON.stringify(formData);
      setHasUnsavedChanges(!isEqual);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonChange = (index, field, value) => {
    const updatedPeople = [...formData.people];
    updatedPeople[index] = {
      ...updatedPeople[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      people: updatedPeople
    }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...formData.vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      vehicles: updatedVehicles
    }));
  };

  const handleNewPersonChange = (field, value) => {
    setNewPerson(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewVehicleChange = (field, value) => {
    setNewVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPerson = () => {
    // Basic validation
    if (!newPerson.dni || !newPerson.name) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'El DNI y el nombre son obligatorios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    // Check for duplicate DNI
    if (formData.people.some(person => person.dni === newPerson.dni)) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI duplicado',
        text: 'Ya existe una persona con este DNI',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
    
    setNewPerson({ dni: '', name: '', phone: '' });
  };

  const addVehicle = () => {
    // Basic validation
    if (!newVehicle.matricula) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'La matrícula es obligatoria',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    // Check for duplicate license plate
    if (formData.vehicles.some(vehicle => vehicle.matricula === newVehicle.matricula)) {
      Swal.fire({
        icon: 'warning',
        title: 'Matrícula duplicada',
        text: 'Ya existe un vehículo con esta matrícula',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle]
    }));
    
    setNewVehicle({ matricula: '', model: '', color: '' });
  };

  const removePerson = (index) => {
    setFormData(prev => {
      const people = [...prev.people];
      people.splice(index, 1);
      return { ...prev, people };
    });
  };

  const removeVehicle = (index) => {
    setFormData(prev => {
      const vehicles = [...prev.vehicles];
      vehicles.splice(index, 1);
      return { ...prev, vehicles };
    });
  };

  const confirmClose = () => {
    if (hasUnsavedChanges) {
      Swal.fire({
        title: '¿Cerrar sin guardar?',
        text: 'Tienes cambios sin guardar que se perderán',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(false);
        }
      });
    } else {
      setShowModal(false);
    }
  };

  const validateForm = () => {
    // Basic required fields validation
    if (!formData.status || !formData.type || !formData.location || !formData.description) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Todos los campos principales son obligatorios',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await updateIncident(incident.code, formData);
      setLoading(false);
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Incidencia actualizada',
          text: 'La incidencia se ha actualizado correctamente.',
          confirmButtonText: 'Aceptar'
        });
        setShowModal(false);
        setHasUnsavedChanges(false);
        if (onSuccess) onSuccess();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Hubo un problema al actualizar la incidencia.',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating incident:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha podido actualizar la incidencia.',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-8">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Editar Incidencia {incident?.code}</h3>
          <button 
            onClick={confirmClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                name="status" 
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Seleccionar Estado</option>
                <option value="Open">Abierto</option>
                <option value="In Progress">En Progreso</option>
                <option value="Closed">Cerrado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select 
                name="type" 
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Seleccionar Tipo</option>
                <option value="Accidente">Accidente</option>
                <option value="Robo">Robo</option>
                <option value="Vandalismo">Vandalismo</option>
                <option value="Animales">Animales</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>
            
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="4"
              required
            ></textarea>
          </div>
          
          {/* People Section */}
          <div className="mb-6">
            <h4 className="font-medium text-lg border-b pb-2 mb-3">Personas Involucradas</h4>
            
            {formData.people.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm mb-2 px-2">
                  <div className="col-span-3">DNI</div>
                  <div className="col-span-4">Nombre</div>
                  <div className="col-span-3">Teléfono</div>
                  <div className="col-span-2">Acciones</div>
                </div>
                
                {formData.people.map((person, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded">
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={person.dni} 
                        onChange={(e) => handlePersonChange(index, 'dni', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="DNI"
                      />
                    </div>
                    <div className="col-span-4">
                      <input 
                        type="text" 
                        value={person.name} 
                        onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={person.phone} 
                        onChange={(e) => handlePersonChange(index, 'phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Teléfono"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <button 
                        type="button" 
                        onClick={() => removePerson(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add new person */}
            <div className="grid grid-cols-12 gap-2 items-center bg-blue-50 p-3 rounded mt-2">
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={newPerson.dni} 
                  onChange={(e) => handleNewPersonChange('dni', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="DNI"
                />
              </div>
              <div className="col-span-4">
                <input 
                  type="text" 
                  value={newPerson.name} 
                  onChange={(e) => handleNewPersonChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Nombre"
                />
              </div>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={newPerson.phone} 
                  onChange={(e) => handleNewPersonChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Teléfono"
                />
              </div>
              <div className="col-span-2 text-center">
                <button 
                  type="button" 
                  onClick={addPerson}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
          
          {/* Vehicles Section */}
          <div className="mb-6">
            <h4 className="font-medium text-lg border-b pb-2 mb-3">Vehículos Involucrados</h4>
            
            {formData.vehicles.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-11 gap-2 font-medium text-sm mb-2 px-2">
                  <div className="col-span-3">Matrícula</div>
                  <div className="col-span-4">Modelo</div>
                  <div className="col-span-2">Color</div>
                  <div className="col-span-2">Acciones</div>
                </div>
                
                {formData.vehicles.map((vehicle, index) => (
                  <div key={index} className="grid grid-cols-11 gap-2 mb-2 items-center bg-gray-50 p-2 rounded">
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={vehicle.matricula} 
                        onChange={(e) => handleVehicleChange(index, 'matricula', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Matrícula"
                      />
                    </div>
                    <div className="col-span-4">
                      <input 
                        type="text" 
                        value={vehicle.model} 
                        onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Modelo"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        value={vehicle.color} 
                        onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Color"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <button 
                        type="button" 
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add new vehicle */}
            <div className="grid grid-cols-11 gap-2 items-center bg-blue-50 p-3 rounded mt-2">
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={newVehicle.matricula} 
                  onChange={(e) => handleNewVehicleChange('matricula', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Matrícula"
                />
              </div>
              <div className="col-span-4">
                <input 
                  type="text" 
                  value={newVehicle.model} 
                  onChange={(e) => handleNewVehicleChange('model', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Modelo"
                />
              </div>
              <div className="col-span-2">
                <input 
                  type="text" 
                  value={newVehicle.color} 
                  onChange={(e) => handleNewVehicleChange('color', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  placeholder="Color"
                />
              </div>
              <div className="col-span-2 text-center">
                <button 
                  type="button" 
                  onClick={addVehicle}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
          
          {/* Display unsaved changes warning */}
          {hasUnsavedChanges && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Tienes cambios sin guardar
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={confirmClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncidentModal; 