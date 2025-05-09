import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Loayaut() {
    return (
        <div>
            <header>
                <h1>POLICIA TAUSTE</h1>
            </header>

            <div className="contenedor-lateral">
                <nav className="menu-lateral">
                    <ul>
                        <li><Link to="/incidencia">Mostrar incidencias</Link></li>
                        <li><Link to="/personas">Personas de interés</Link></li>
                        <li><Link to="/estadisticas">Estadísticas</Link></li>
                        <li><Link to="/crear-incidencia">Abrir incidencia</Link></li>
                        <li><Link to="/mapa">Mapa delincuencial</Link></li>
                    </ul>
                </nav>
                <main>
<Outlet/>    
                </main>
            </div>
        </div>
    );
}

export default Loayaut;
