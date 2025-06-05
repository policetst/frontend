import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import { getOpenIncidents } from '../funcs/Incidents';
function Notifications() {  const [showTasks, setShowTasks] = useState(false);
  const [openIncidents, setOpenIncidents] = useState([]);
  const [count, setCount] = useState(0);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchOpenIncidents = async () => {
        const incidents = await getOpenIncidents();
        setOpenIncidents(incidents);
        setCount(incidents.length);
    };
    fetchOpenIncidents();
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTasks(false);
      }
    }
    if (showTasks) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTasks]);

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center transition w-8 h-8"
        aria-label="Notificaciones"
        onClick={() => setShowTasks((prev) => !prev)}
      >
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        <BellRing className="w-6 h-6" />
      </button>

      {/* Dropdown de tareas */}
      {showTasks && (
        <div
          ref={dropdownRef}
          className="fixed top-16 right-4 w-64 bg-white rounded-md shadow-lg z-50 border border-zinc-400"
        >
          <div className="p-4 border-b font-semibold text-white bg-[#002856]">
            Incidencias abiertas
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-sm text-gray-700">
            {openIncidents.map((incident) => (
              <Link key={incident.code} to={`/editincident/${incident.code}`}>
                <li className="p-3 hover:bg-gray-50 cursor-pointer">
                  {incident.description}
                </li>
              </Link>
            ))}
          </ul>
          <div className="p-2 text-center text-xs text-blue-500 hover:underline cursor-pointer">
            <Link
              to="/incidencia"
              className="px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
              onClick={() => setShowTasks(false)}
            >
              Ir a Mostrar incidencias
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
