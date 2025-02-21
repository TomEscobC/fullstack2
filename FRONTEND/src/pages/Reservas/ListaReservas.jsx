import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from 'react-bootstrap';
import "./ListaReservas.css"; // Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReserva, setCurrentReserva] = useState(null);
  const [filtroRut, setFiltroRut] = useState('');
  const [filtroCabaña, setFiltroCabaña] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [reservasFiltradas, setReservasFiltradas] = useState(reservas); // Guardamos las reservas filtradas

  // Ver detalles de la reserva
  const handleView = (reserva) => {
    setCurrentReserva(reserva);
    setShowViewModal(true);
  };

  // Editar reserva
  const handleEdit = (reserva) => {
    setCurrentReserva(reserva);
    setShowEditModal(true);
  };

const [update, setUpdate] = useState(false);
    // Actualizar reserva en la base de datos
const handleUpdate = async () => {
  try {
    // Verificar que los datos de la reserva estén completos
    if (!currentReserva) {
      alert("No hay datos para actualizar.");
      return;
    }

    // Obtener el token desde localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found!");
      alert("No se encontró el token de autenticación.");
      return;
    }

    // Realizar la solicitud para actualizar la reserva
    const response = await fetch(`http://localhost:3000/api/reservations/${currentReserva._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  // Agregar el token en los encabezados
      },
      body: JSON.stringify(currentReserva),
    });

    if (response.ok) {
      const updatedReserva = await response.json();
      alert("Reserva actualizada correctamente");

      // Cerrar el modal
      setShowEditModal(false);

      // Actualizar la lista de reservas (opcional)
      setReservas((prev) => prev.map((reserva) =>
        reserva._id === updatedReserva._id ? updatedReserva : reserva
      ));
      setUpdate(true);
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Error al actualizar la reserva");
    }
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    alert("Error al conectar con el servidor");
  }
};


// Eliminar reserva
const handleDelete = async (id) => {
  try {
    // Obtener el token desde localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found!");
      alert("No se encontró el token de autenticación.");
      return;
    }

    // Realizar la solicitud para eliminar la reserva
    const response = await fetch(`http://localhost:3000/api/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,  // Agregar el token en los encabezados
      },
    });

    if (response.ok) {
      setReservas(reservas.filter((reserva) => reserva._id !== id));
    } else {
      alert('Error al eliminar la reserva');
    }
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
  }
};


// Obtener reservas
useEffect(() => {
  const fetchReservas = async () => {
    try {
      // Obtener el token desde localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("No token found!");
        alert("No se encontró el token de autenticación.");
        return;
      }

      // Realizar la solicitud para obtener las reservas
      const response = await fetch("http://localhost:3000/api/reservations/lista", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // Agregar el token en los encabezados
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservas(data);
      } else {
        alert("Error al obtener las reservas");
      }
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };

  fetchReservas();
}, [showEditModal]);  // Se vuelve a ejecutar cuando se actualiza el estado de showEditModal

  // Filtrar las reservas cada vez que los filtros cambien
  useEffect(() => {
    const reservasFiltradas = reservas.filter(reserva => {
      const filtroPorRut = filtroRut ? reserva.client.documentNumber.includes(filtroRut) : true;
      const filtroPorCabaña = filtroCabaña ? reserva.cabin.number === filtroCabaña : true;
      const filtroPorFecha = filtroFecha ? (
        new Date(reserva.checkinDate).toISOString().split('T')[0] === filtroFecha ||
        new Date(reserva.checkoutDate).toISOString().split('T')[0] === filtroFecha
      ) : true;

      return filtroPorRut && filtroPorCabaña && filtroPorFecha;
    });

    setReservasFiltradas(reservasFiltradas);
  }, [filtroRut, filtroCabaña,  reservas]);

  const handleFiltroRut = (e) => {
    setFiltroRut(e.target.value);
  };

  const handleFiltroCabaña = (e) => {
    setFiltroCabaña(e.target.value);
  };


  return (
    <div className="content-listares">
      <h1>Buscador de Reservas</h1>
      {/* Filtros */}
      <Form inline="true">
        <Form.Group className="mb-2 mr-sm-2">
          <Form.Control
            type="text"
            placeholder="Filtrar por RUT"
            value={filtroRut}
            onChange={handleFiltroRut}
          />
        </Form.Group>

        <Form.Group className="mb-2 mr-sm-2">
          <Form.Control
            as="select"
            value={filtroCabaña}
            onChange={handleFiltroCabaña}
          >
            <option value="">Filtrar por Cabaña</option>
            {reservas.map((reserva, index) => (
              <option key={reserva.cabin._id || `cabin-${index}`} value={reserva.cabin.number}>
                {reserva.cabin.number}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form>

      <table className="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>RUT</th>
            <th>Habitación</th>
            <th>Fecha de Entrada</th>
            <th>Fecha de Salida</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservasFiltradas.map((reserva) => (
            <tr key={reserva._id}>
              <td>{reserva.client.name}</td>
              <td>{reserva.client.documentNumber}</td>
              <td>{reserva.cabin.number}</td>
              <td>{new Date(reserva.checkinDate).toLocaleDateString()}</td>
              <td>{new Date(reserva.checkoutDate).toLocaleDateString()}</td>
              <td>{new Date(reserva.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-info" onClick={() => handleView(reserva)}>Ver</button>
                <button className="btn btn-warning" onClick={() => handleEdit(reserva)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(reserva._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de ver */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header>
          <Modal.Title>Detalles de la Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentReserva && (
            <div>
              <p><strong>Nombre del Cliente:</strong> {currentReserva.client.name}</p>
              <p><strong>Tipo de Documento:</strong> {currentReserva.clientDocumentType}</p>
              <p><strong>Número de Documento:</strong> {currentReserva.client.documentNumber}</p>
              <p><strong>Teléfono:</strong> {currentReserva.client.phone || "No registrado"}</p>
              <p><strong>Email:</strong> {currentReserva.client.email}</p>
              <h4>Información de la Cabaña</h4>
              <p><strong>Nombre:</strong> {`${currentReserva.cabin.type} ${currentReserva.cabin.number}`}</p>
              <p><strong>Capacidad:</strong> {`Adultos: ${currentReserva.cabin.maxAdults}, Niños: ${currentReserva.cabin.maxChildren}`}</p>
              <p><strong>¿Tiene Jacuzzi?</strong> {currentReserva.cabin.hasHotTub ? "Sí" : "No"}</p>
              <p><strong>Estado:</strong> {currentReserva.cabin.status}</p>
              <p><strong>Precio por noche:</strong> {`${currentReserva.cabin.price} ${currentReserva.cabin.currency}`}</p>
              <h4>Detalles de la Reserva</h4>
              <p><strong>Fecha de Check-in:</strong> {new Date(currentReserva.checkinDate).toLocaleDateString()}</p>
              <p><strong>Fecha de Check-out:</strong> {new Date(currentReserva.checkoutDate).toLocaleDateString()}</p>
              <p><strong>Noches Reservadas:</strong> {Math.ceil((new Date(currentReserva.checkoutDate) - new Date(currentReserva.checkinDate)) / (1000 * 60 * 60 * 24))} noches</p>
              <h4>Información de Pago</h4>
              <p><strong>Método de Pago:</strong> {currentReserva.paymentMethod}</p>
              <p><strong>Origen del Pago:</strong> {currentReserva.paymentOrigin}</p>
              <h4>Estado y Registro</h4>
              <p><strong>Estado de la Reserva:</strong> {currentReserva.isHistorical ? "Histórica" : "Activa"}</p>
              <p><strong>Fecha de Creación:</strong> {new Date(currentReserva.createdAt).toLocaleString()}</p>
              <p><strong>Última Actualización:</strong> {new Date(currentReserva.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de editar */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header>
          <Modal.Title>Editar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentReserva && (
            <Form>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReserva.client.name}
                  onChange={(e) =>
                    setCurrentReserva({
                      ...currentReserva,
                      client: { ...currentReserva.client, name: e.target.value },
                    })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReserva ? currentReserva.client.documentNumber : ""}
                  onChange={(e) =>
                    setCurrentReserva({
                      ...currentReserva,
                      client: { ...currentReserva.client, documentNumber: e.target.value },
                    })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Fecha de Entrada</Form.Label>
                <Form.Control
                  type="date"
                  value={currentReserva ? new Date(currentReserva.checkinDate).toLocaleDateString('en-CA') : ''}
                  onChange={(e) => setCurrentReserva({ ...currentReserva, checkinDate: e.target.value })}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Fecha de Salida</Form.Label>
                <Form.Control
                  type="date"
                  value={currentReserva ? new Date(currentReserva.checkoutDate).toLocaleDateString('en-CA') : ''}
                  onChange={(e) => setCurrentReserva({ ...currentReserva, checkoutDate: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reservas;
