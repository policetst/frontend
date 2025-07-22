import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import FormularioIncidencia from '../../src/components/FormularioIncidencia'
import Swal from 'sweetalert2' // <- Importa para mockear el fire real

// Stubs exactos según tus imports
const MockMapview = () => <div data-testid="mock-map">[Mapa simulado]</div>
const MockImageUpload = ({ onImagesChange }) => (
  <button
    data-testid="fake-upload"
    onClick={() => onImagesChange([new File([''], 'photo.png', { type: 'image/png' })])}
  >
    Subir foto simulada
  </button>
)

describe('<FormularioIncidencia /> flujo completo', () => {
  beforeEach(() => {
    localStorage.setItem('username', 'AR00001')

    // Mock de navegación (si tienes lógica especial en useNavigate)
    const mockNavigate = cy.stub().as('navigate')
    window.mockNavigate = mockNavigate

    // Mock de SweetAlert2 sobre el import real
    cy.stub(Swal, 'fire').as('swalFire')

    // Intercepta peticiones HTTP relevantes
    cy.intercept('POST', '**/upload', { file: { url: 'fake-url' } }).as('uploadFile')
    cy.intercept('POST', '**/incidents', { ok: true }).as('createIncident')
    cy.intercept('GET', '**/people/12345678A*', {
      ok: true,
      data: { dni: '12345678A', first_name: 'Juan', last_name1: 'Pérez', last_name2: 'García', phone_number: '666777888' }
    }).as('getPerson')
    cy.intercept('GET', '**/vehicles/4704JBN*', {
      ok: true,
      data: { license_plate: '4704JBN', brand: 'Dacia', model: 'Sandero', color: 'Gris' }
    }).as('getVehicle')
  })

  it('permite crear una incidencia completa (flujo principal)', () => {
    cy.mount(
      <CookiesProvider>
        <BrowserRouter>
          <FormularioIncidencia />
        </BrowserRouter>
      </CookiesProvider>,
      {
        componentStubs: {
          Mapview: MockMapview,
          ImageUpload: MockImageUpload,
        }
      }
    )
    // Datos esenciales
    cy.get('input[name="location"]').clear().type('40.416775,-3.703790')
    cy.get('select[name="type"]').select('Trafico')
    cy.get('textarea[name="description"]').type('Colisión entre dos vehículos en un cruce')
    cy.get('input[name="brigade_field"]').check()

    // Agregar persona automática (por blur)
    cy.contains('button', 'Nueva persona').click()
    cy.get('input[placeholder="DNI - NIE"]').type('12345678A').blur()
    // cy.wait('@getPerson')
    // cy.contains('Juan Pérez García').should('exist')

    // Agregar vehículo automática (por blur)
    cy.contains('button', 'Nuevo vehículo').click()
    cy.get('input[placeholder="4704JBN"]').type('4704JBN').blur()
    cy.wait('@getVehicle')
    cy.contains('Dacia Sandero').should('exist')

    // Subir imagen mock
    // cy.get('[data-testid="fake-upload"]').click()

    // Enviar formulario
    cy.contains('button', 'Crear incidencia').click()
    // cy.wait('@uploadFile')
    cy.wait('@createIncident')

    // Verifica feedback de éxito de Swal
    cy.get('@swalFire').should('have.been.calledWith', {
      icon: 'success',
      title: 'Incidencia creada',
      text: 'La incidencia se ha creado correctamente.',
      confirmButtonText: 'Aceptar'
    })
    // cy.get('@navigate').should('have.been.calledWith', '/incidencia')
  })

  it('permite agregar personas manualmente', () => {
    cy.mount(
      <CookiesProvider>
        <BrowserRouter>
          <FormularioIncidencia />
        </BrowserRouter>
      </CookiesProvider>,
      {
        componentStubs: {
          Mapview: MockMapview,
          ImageUpload: MockImageUpload,
        }
      }
    )
    cy.contains('button', 'Nueva persona').click()
    cy.get('input[placeholder="DNI - NIE"]').type('Y6087865D')
    cy.get('input[placeholder="Nombre"]').type('María')
    cy.get('input[placeholder="1º Apellido"]').type('González')
    cy.get('input[placeholder="2º Apellido"]').type('López')
    cy.get('input[placeholder="643 321 177 4"]').type('600123456')
    cy.contains('button', 'Agregar persona').click()
    cy.contains('María González López').should('exist')
    cy.contains('Y6087865D').should('exist')
    cy.contains('Eliminar').first().click()
    cy.contains('María González López').should('not.exist')
  })

  it('permite agregar vehículos manualmente', () => {
    cy.mount(
      <CookiesProvider>
        <BrowserRouter>
          <FormularioIncidencia />
        </BrowserRouter>
      </CookiesProvider>,
      {
        componentStubs: {
          Mapview: MockMapview,
          ImageUpload: MockImageUpload,
        }
      }
    )
    cy.contains('button', 'Nuevo vehículo').click()
    cy.get('input[placeholder="4704JBN"]').type('8982DNH')
    cy.get('input[placeholder="Marca"]').type('Toyota')
    cy.get('input[placeholder="Modelo"]').type('Corolla')
    cy.get('input[placeholder="Color"]').type('Azul')
    cy.contains('button', 'Agregar vehículo').click()
    cy.contains('Toyota Corolla').should('exist')
    cy.contains('8982DNH').should('exist')
    cy.contains('Azul').should('exist')
    cy.contains('Eliminar').first().click()
    cy.contains('Toyota Corolla').should('not.exist')
  })
})
