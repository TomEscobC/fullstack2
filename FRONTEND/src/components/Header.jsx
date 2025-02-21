import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <div className="header">
        <img src="Uploads/logo_CHELENKO-copy-White-Final.png" alt="Logo Chelenko" />
        <div className="contenedor-usuario">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
          </svg>
          <p className="username">Bienvenido/a:</p>
          <p id="ejemplo-user">USUARIO</p>
        </div>
        <p id="desconectarse">
          <Link to="./Loging">Desconectarse</Link>
        </p>
      </div>
    </header>
  );
}

export default Header;
