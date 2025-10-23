import React, { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { getTokenFromCookie } from '../funcs/Incidents'

const API_URL = import.meta.env.VITE_BASE_URL

// El compañero que se añade SIEMPRE es el user logueado (team_mate_code)
// El creador es creator_user_code
// Si team_mate existe, ya hay compañero asignado y no se puede añadir
function AddTeammate({ incident_code, team_mate_code, creator_user_code, team_mate, onTeammateAdded }) {
  const [loading, setLoading] = useState(false)

  // El botón se desactiva si el usuario que intenta añadirse es el creador de la incidencia o ya hay un compañero asignado
  const buttonDisabled = team_mate_code === creator_user_code || !!team_mate

  const add_teammate = async () => {
    const result = await Swal.fire({
      title: 'Añadir compañero?',
      text: '¿Estás seguro de que quieres añadirte como compañero?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, añadir',
      cancelButtonText: 'No, cancelar'
    })

    if (result.isConfirmed) {
      setLoading(true)
      try {
        const token = getTokenFromCookie()
        const response = await axios.put(
          `${API_URL}/incidents/${incident_code}/teammate/${team_mate_code}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        if (response.status === 200) {
          await Swal.fire({
            title: 'Compañero añadido',
            text: 'Te has añadido correctamente como compañero.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          })
          // Si quieres refrescar los datos del padre, puedes usar onTeammateAdded()
          if (onTeammateAdded) onTeammateAdded()
          // Si no, simplemente puedes actualizar el estado local aquí si lo necesitas
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          'Error al añadir el compañero. Puede que ya esté añadido o que haya ocurrido un problema.'
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
        })
      } finally {
        setLoading(false)
      }
    } else {
      // No hacer nada si cancela
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        disabled={buttonDisabled}
        className='mt-2 px-4 py-2 
                bg-[#002856] text-white rounded border
                hover:bg-gray-300 hover:text-black hover:border-[#002856]
                active:bg-gray-100 active:text-black  active:border-gray-800'
        onClick={add_teammate}
      >
        {loading ? 'Añadiendo...' : 'Añadirte como compañero'}
      </button>
      {team_mate && (
        <div className='mt-1 text-sm text-gray-600'>
          Compañero asignado: {team_mate}
        </div>
      )}
    </div>
  )
}

export default AddTeammate
