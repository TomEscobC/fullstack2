import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header"
import Footer from "../../components/Footer";
import "./EstadoCabañas.css"; 

const EstadoCabañas = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Datos de las habitaciones
  const habitaciones = [
    { number: "01", status: "ocupado" },
    { number: "02", status: "disponible" },
    { number: "03", status: "disponible" },
    { number: "04", status: "disponible" },
    { number: "05", status: "ocupado" },
    { number: "06", status: "disponible" },
    { number: "07", status: "disponible" },
    { number: "08", status: "ocupado" },
    { number: "09", status: "ocupado" },
    { number: "10", status: "pendiente" },
    { number: "11", status: "disponible" },
    { number: "12", status: "ocupado" },
    { number: "13", status: "disponible" },
    { number: "14", status: "ocupado" },
    { number: "15", status: "disponible" },
    { number: "16", status: "ocupado" },
    { number: "17", status: "disponible" },
    { number: "18", status: "disponible" },
    { number: "19", status: "disponible" },
    { number: "20", status: "ocupado" },
  ];

  // Filtrar habitaciones según el estado seleccionado
  const filteredRooms =
    filter === "all"
      ? habitaciones
      : habitaciones.filter((room) => room.status === filter);

  // Función para manejar clic en una tarjeta
  const handleCardClick = (roomNumber) => {
    navigate(`/Lista-Cabañas?search=${roomNumber}`); // Navegar a la vista de ListaCabañas con el parámetro de búsqueda
  };

  return (
    <div className="content-estado">
      <h1 className="text-center mb-4">Estado de Cabañas</h1>

      {/* Filtros */}
      <div className="d-flex justify-content-between mb-4">
        <select
          id="filterStatus"
          className="form-select w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos los Estados</option>
          <option value="disponible">Disponible</option>
          <option value="ocupado">Ocupado</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Tarjetas de estado de habitaciones */}
      <div id="roomStatusList" className="row">
        {filteredRooms.map((room) => (
          <div
            key={room.number}
            className={`col-md-4 mb-4 room-card`}
            data-number={room.number}
            data-status={room.status}
            onClick={() => handleCardClick(room.number)} // Agregar evento de clic
          >
            <div className={`card ${room.status}`}>
              <h2>Habitación {room.number}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstadoCabañas;
