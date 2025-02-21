import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_CHELENKO-copy-White-Final.png"; // Asegúrate de que la imagen esté en la carpeta adecuada
import "./BarraLateral.css"; // Importar estilos externos si es necesario

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  return (
    <div className="sidebar">
      <ul>
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <li className="nav-item">
          <Link className="nav-link active" to="/reportes">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/usuario">Usuario</Link>
        </li>
        <li className="nav-item">
          <div className="nav-link" onClick={() => toggleSubMenu("reserva")}>Reserva</div>
          {openSubMenu === "reserva" && (
            <ul className="submenu">
              <li><Link className="nav-link" to="/añadir-reservas">Nueva Reserva</Link></li>
              <li><Link className="nav-link" to="/lista-reservas">Lista Reservas</Link></li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <div className="nav-link" onClick={() => toggleSubMenu("cabañas")}>Cabañas</div>
          {openSubMenu === "cabañas" && (
            <ul className="submenu">
              <li><Link className="nav-link" to="/lista-cabañas">Lista Cabañas</Link></li>
              <li><Link className="nav-link" to="/estado-cabañas">Estado Cabañas</Link></li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/tinaja">Tinaja</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/cerrar-sesion">Cerrar Sesión</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
