import React, { useState , useEffect  } from 'react';
import SuiteImage from '../../assets/Suite.jpg';
import TainyImage from '../../assets/Tainy.jpg';
import RvigenteImage from "../../assets/Rvigente.png";
import RpendienteImage from "../../assets/Rpendientepago.png";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './ListaCabañas.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Datos de las habitaciones
const roomsData = [
  { number: "01", type: "suite", status: "ocupado", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "02", type: "suite", status: "disponible", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage},
  { number: "03", type: "suite", status: "disponible", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "04", type: "suite", status: "disponible", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "05", type: "suite", status: "ocupado", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "06", type: "suite", status: "disponible", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "07", type: "suite", status: "disponible", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "08", type: "suite", status: "ocupado", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "09", type: "suite", status: "ocupado", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "10", type: "suite", status: "pendiente", price: 91900, description: "Cabaña grande para 2 personas", image: SuiteImage },
  { number: "11", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "12", type: "tainycabin", status: "ocupado", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "13", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "14", type: "tainycabin", status: "ocupado", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "15", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "16", type: "tainycabin", status: "ocupado", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "17", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "18", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "19", type: "tainycabin", status: "disponible", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
  { number: "20", type: "tainycabin", status: "ocupado", price: 160900, description: "Cabaña familiar 2 adultos 2 niños", image: TainyImage },
];

// Componente de tarjeta de habitación
const RoomCard = ({ room, onCardClick }) => {
    return (
      <div 
        className="col-md-4 mb-4"
        onClick={() => onCardClick(room)} // Llama a la función para abrir el modal
        style={{ cursor: "pointer" }}
      >
        <div className="card">
          <img src={room.image} className="card-img-top" alt={room.type} />
          <div className="card-body">
            <h5 className="card-title">Habitación {room.number}</h5>
            <p className="card-text">
              <strong>Tipo:</strong> {room.type === "suite" ? "Suite" : "Tainy Cabin"}<br />
              <strong>Precio:</strong> ${room.price.toLocaleString()} CLP<br />
              <strong>Estado:</strong> {room.status}<br />
              <strong>Descripción:</strong> {room.description}
            </p>
            <button
                  className="btn btn-success me-2"
                  onClick={() => handleEditRoom(room.number)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveRoom(room.number)}
                >
                  Eliminar
                </button>
          </div>
        </div>
      </div>
    );
  };
  //---------------------------------------------------------------------
 // Componente principal
const ListaCabañas = () => {
    const [filters, setFilters] = useState({
      type: "all",
      status: "all",
      search: "",
    });
  
    const [selectedRoom, setSelectedRoom] = useState(null); // Estado para la cabaña seleccionada
    const [showModal, setShowModal] = useState(false); // Controla si el modal está visible
  
  // Función para abrir el modal
const handleCardClick = (room) => {
    if (room.status === "disponible") {
      setShowModal(false); // Asegurar que el modal no se abra si es disponible
    } else {
      setSelectedRoom(room); // Guarda la cabaña seleccionada
      setShowModal(true); // Muestra el modal si el estado es distinto a disponible
    }
  };
  
    // Función para cerrar el modal
    const handleCloseModal = () => {
      setSelectedRoom(null); // Resetea la cabaña seleccionada
      setShowModal(false); // Oculta el modal
    };

    
    // Leer el parámetro 'search' de la URL al cargar la vista
    useEffect(() => {
      const params = new URLSearchParams(location.search); // Obtener los parámetros
      const searchParam = params.get("search"); // Leer el valor de "search"
      if (searchParam) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          search: searchParam, // Aplicar el número de la habitación al filtro de búsqueda
        }));
      }
    }, [location.search]);

    // Función para actualizar los filtros
    const handleFilterChange = (filter, value) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filter]: value,
      }));
    };
  
    // Filtrar las habitaciones según los filtros
    const filteredRooms = roomsData.filter((room) => {
      const matchesType = filters.type === "all" || room.type === filters.type;
      const matchesStatus = filters.status === "all" || room.status === filters.status;
      const matchesSearch = room.number.includes(filters.search);
      return matchesType && matchesStatus && matchesSearch;
    });
  
    return (
      <div className="content-lista">
        <h1 className="text-center mb-4">Listado de Cabañas</h1>
  
{/* Filtros */}
<div className="filters-container">
  <select
    className="form-select"
    onChange={(e) => handleFilterChange("type", e.target.value)}
  >
    <option value="all">Todos los Tipos</option>
    <option value="tainycabin">Tainy Cabin</option>
    <option value="suite">Suite</option>
  </select>

  <select
    className="form-select"
    onChange={(e) => handleFilterChange("status", e.target.value)}
  >
    <option value="all">Todos los Estados</option>
    <option value="disponible">Disponible</option>
    <option value="ocupado">Ocupado</option>
    <option value="pendiente">Pendiente</option>
  </select>

  <input
    type="text"
    className="form-control"
    placeholder="Buscar por número de habitación"
    onChange={(e) => handleFilterChange("search", e.target.value)}
    value={filters.search}
  />
</div>
  
        {/* Listado de cabañas */}
        <div className="row">
          {filteredRooms.length === 0 ? (
            <p>No se encontraron cabañas que coincidan con los filtros.</p>
          ) : (
            filteredRooms.map((room) => (
              <RoomCard key={room.number} room={room} onCardClick={handleCardClick} />
            ))
          )}
        </div>
  
        {/* Modal */}
        {showModal && selectedRoom && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={handleCloseModal}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Habitación {selectedRoom.number}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={
                      selectedRoom.status === "ocupado"
                        ? RvigenteImage
                        : selectedRoom.status === "pendiente"
                        ? RpendienteImage
                        : selectedRoom.image
                    }
                    alt={`Estado de la habitación: ${selectedRoom.status}`}
                    className="img-fluid"
                  />
                  <p className="mt-3">
                    Estado: <strong>{selectedRoom.status}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default ListaCabañas;