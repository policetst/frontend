import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import EditIncident from '../../src/pages/EditIncident'
import Swal from 'sweetalert2'

// ----------- MOCK COMPONENTS (COINCIDE CON TUS IMPORTS REALES) ----------
const MockMapview = () => <div data-testid="mock-map">[Mapa simulado]</div>
const MockImageUpload = ({ onImagesChange }) => (
  <button
    data-testid="fake-upload"
    onClick={() => onImagesChange([new File([''], 'photo.png', { type: 'image/png' })])}
  >
    Subir foto simulada
  </button>
)
const MockAddTeammate = () => <div data-testid="mock-teammate">[Teammate Simulado]</div>

// ----------- TEST SUITE -----------
describe('<EditIncident /> flujo completo', () => {
  beforeEach(() => {
    localStorage.setItem('username', 'AR00001')

    // Stub de SweetAlert2 para capturar TODOS los Swal.fire
    cy.stub(Swal, 'fire').as('swalFire')

    // --- MOCKEO TODAS LAS PETICIONES IMPORTANTES ---
    cy.intercept('GET', '**/incidents/INC999', {
      ok: true,
      status: 'Open',
      location: '41.111,-0.111',
      type: 'Trafico',
      description: 'Prueba de edición E2E',
      brigade_field: true,
      creator_user_code: 'AR00001',
      people: [
        { dni: '12345678A', first_name: 'Juan', last_name1: 'Pérez', last_name2: 'García', phone_number: '600123456' }
      ],
      vehicles: [
        { license_plate: '4704JBN', brand: 'Dacia', model: 'Sandero', color: 'Gris' }
      ],
      images: []
    }).as('getIncident')

    cy.intercept('POST', '**/upload', { file: { url: 'fake-url' } }).as('uploadFile')
    cy.intercept('PUT', '**/incidents/INC999', { ok: true }).as('updateIncident')
    cy.intercept('POST', '**/send-email', { ok: true }).as('sendEmail')
    cy.intercept('POST', '**/closeIncident', { ok: true }).as('closeIncident')
    cy.intercept('DELETE', '**/deleteImage*', { ok: true }).as('deleteImage')
  })

  it('permite editar y guardar una incidencia (flujo completo)', () => {
    cy.mount(
      <CookiesProvider>
        <MemoryRouter initialEntries={['/editarincidencia/INC999']}>
          <Routes>
            <Route path="/editarincidencia/:code" element={<EditIncident />} />
          </Routes>
        </MemoryRouter>
      </CookiesProvider>,
      {
        componentStubs: {
          Mapview: MockMapview,
          ImageUpload: MockImageUpload,
          AddTeammate: MockAddTeammate,
        }
      }
    )

    // --- ESPERA CARGA INCIDENTE ---
    // cy.wait('@getIncident')

    // --- CHEQUEA QUE LOS DATOS EXISTEN EN EL FORMULARIO ---
    // cy.get('input[name="location"]').should('have.value', '41.111,-0.111')
    // cy.get('select[name="type"]').should('have.value', 'Trafico')
    cy.get('textarea[name="description"]').should('have.value', 'Prueba de edición E2E')
    cy.get('input[name="brigade_field"]').should('be.checked')

    // --- CHECKEAMOS PERSONAS Y VEHÍCULOS RENDERIZADOS ---
    cy.contains('Juan Pérez García').should('exist')
    cy.contains('Dacia Sandero').should('exist')

    // --- AGREGA UNA PERSONA MANUALMENTE ---
    cy.contains('button', 'Nueva persona').click()
    cy.get('input[placeholder="DNI - NIE"]').type('87654321Z')
    cy.get('input[placeholder="Nombre"]').type('María')
    cy.get('input[placeholder="1º Apellido"]').type('González')
    cy.get('input[placeholder="2º Apellido"]').type('López')
    cy.get('input[placeholder="643 321 177 4"]').type('600999888')
    cy.contains('button', 'Añadir persona').click()
    cy.contains('María González López').should('exist')

    // --- ELIMINA PERSONA ---
    cy.contains('María González López').parent().find('button').contains('Eliminar').click()
    // Simula confirmación SweetAlert (llama a .then si quieres simular la promesa)
    cy.get('@swalFire').should('be.calledWithMatch', { title: 'Eliminar persona' })

    // --- AGREGA VEHÍCULO MANUALMENTE ---
    cy.contains('button', 'Nuevo vehículo').click()
    cy.get('input[placeholder="4704JBN"]').type('9999XYZ')
    cy.get('input[placeholder="Marca"]').type('Renault')
    cy.get('input[placeholder="Modelo"]').type('Clio')
    cy.get('input[placeholder="Color"]').type('Rojo')
    cy.contains('button', 'Añadir vehículo').click()
    cy.contains('Renault Clio').should('exist')

    // --- ELIMINA VEHÍCULO ---
    cy.contains('Renault Clio').parent().find('button').contains('Eliminar').click()
    cy.get('@swalFire').should('be.calledWithMatch', { title: 'Eliminar vehículo' })

    // --- CAMBIA DESCRIPCIÓN Y GUARDA ---
    cy.get('textarea[name="description"]').clear().type('Descripción editada por Cypress')
    cy.contains('button', 'Actualizar').click()
    // Confirma SweetAlert de actualización
    cy.get('@swalFire').should('be.calledWithMatch', { title: '¿Deseas actualizar la incidencia?' })

    // Simula confirmación automática (para saltar el .then del Swal)
    // (En Cypress real puedes mockear el promise para que pase instantáneo)

    // --- CHEQUEA SWAL ÉXITO FINAL Y LA REDIRECCIÓN ---
    cy.wait('@updateIncident')
    cy.get('@swalFire').should('be.calledWithMatch', { title: 'Incidencia actualizada' })
  })
})
