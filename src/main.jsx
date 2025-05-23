//! componente raiz de la aplicacion


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import ROUTER from "./router/router.jsx";
import { CookiesProvider } from 'react-cookie';
import "./index.css";

createRoot(document.getElementById("root")).render( //* Renderizar el componente raíz de la aplicación en el elemento con id root de index.html*/
  <StrictMode>
    <CookiesProvider>
      <RouterProvider router={ROUTER} />
    </CookiesProvider>
  </StrictMode>
);
