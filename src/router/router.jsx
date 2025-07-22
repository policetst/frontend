import { createHashRouter } from "react-router-dom";

//* Importar los componentes de las páginas */
import NotFound from "../pages/NotFound";
import Perfil from "../pages/Perfil";
import Mapa from "../pages/Mapa";
import Login from "../pages/Login";
import MostrarIncidencia from "../pages/MostrarIncidencia";
import Estadisticas from "../pages/Estadisticas";
import CrearIncidencia from "../pages/CrearIncidencia";
import PaginaPrincipal from "../pages/PaginaPrincipal";
import ForgotPassword from "../pages/ForgotPassword";
import Loayaut from "../loayauts/Loayaut";
import EditIncident from "../pages/EditIncident";
import PersonasVehiculos from "../pages/PersonasVehiculos";
import EditarVehiculo from '../pages/EditarVehiculo';
import EditarPersona from '../pages/EditarPersona';
import Error from "../pages/Error";
import ResetPassword from "../pages/ResetPassword";
import EditUser from '../pages/EditUser';

// 🆕 COMPONENTES PARA ATESTADOS
import DiligenciaForm from "../components/DiligenciaForm";
import AtestadosList from "../components/AtestadosList";
import AtestadoDetail from "../components/AtestadosDetail";
import CrearAtestado from "../components/CrearAtestado";
import EditarAtestado from "../components/EditarAtestado";
import PlantillasList from "../components/PlantillasList";
import CrearPlantilla from "../components/CrearPlantilla";
import EditarPlantilla from "../components/EditarPlantilla";

const ROUTER = createHashRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/forgot",
    element: <ForgotPassword />
  },
  {
    path: "/",
    element: <Loayaut/>,
    errorElement: <Error />,
    children:[
      {
        path: '/reset-password/:code',
        element: <ResetPassword />
      },
      {
        path: '/edituser/:code',
        element: <EditUser/>
      },
      {
        path: '/editincident/:code',
        element: <EditIncident/>
      },
      {
        path: "/",
        element: <PaginaPrincipal />
      },
      {
        path: "/perfil",
        element: <Perfil />
      },
      {
        path: "/mapa",
        element: <Mapa />
      },
      {
        path: "/incidencia/",
        element: <MostrarIncidencia />
      },
      {
        path: "/estadisticas",
        element: <Estadisticas />
      },
      {
        path: "/crear-incidencia",
        element: <CrearIncidencia />
      },
      {
        path: "/personas-y-vehiculos",
        element: <PersonasVehiculos />,
      },
      {
        path: "/editarpersona/:dni",
        element: <EditarPersona />
      },
      {
        path: "/editarvehiculo/:license_plate",
        element: <EditarVehiculo />
      },

      // 🆕 RUTAS PARA ATESTADOS
      {
        path: "/atestados",
        element: <AtestadosList />
      },
      {
        path: "/atestados/nuevo",
        element: <CrearAtestado />
      },
      {
        path: "/atestados/:id",
        element: <AtestadoDetail />
      },
      {
        path: "/atestados/:id/editar",
        element: <EditarAtestado />
      },
      {
        path: "/atestados/:id/diligencias/nueva",
        element: <DiligenciaForm />
      },

      // 🆕 RUTAS PARA PLANTILLAS
      {
        path: "/plantillas",
        element: <PlantillasList />
      },
      {
        path: "/plantillas/nueva",
        element: <CrearPlantilla />
      },
      {
        path: "/plantillas/:id/editar",
        element: <EditarPlantilla />
      },

      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

export default ROUTER;