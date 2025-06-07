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
import EditUser from '../pages/EditUser';


//! make the router to use the hash router
const ROUTER = createHashRouter([
  /*
  
  * con el formato
  * {
  * path: "/ruta",
  * element: <Componente />,
  },
  * }
  */

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
    children:[
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
    {
      path: "*",
      element: <NotFound />
    }
  ]
}
]);

export default ROUTER;
