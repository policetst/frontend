import { createHashRouter } from "react-router-dom";

//* Importar los componentes de las páginas */
import NotFound from "../pages/NotFound";
import Perfil from "../pages/Perfil";
import Mapa from "../pages/Mapa";
import Login from "../pages/Login";
import MostrarIncidencia from "../pages/MostrarIncidencia";
import Estadisticas from "../pages/Estadisticas";
import CrearIncidencia from "../pages/CrearIncidencia";
import Personas from "../pages/Personas";
import PaginaPrincipal from "../pages/PaginaPrincipal";

const ROUTER = createHashRouter([
  {
    path: "/",
    element: <PaginaPrincipal />
  },
  {
    path: "/login",
    element: <Login />
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
    path: "/personas",
    element: <Personas />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default ROUTER;
