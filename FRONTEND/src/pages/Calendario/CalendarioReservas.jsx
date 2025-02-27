import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import "./CalendarioReservas.css"; // Importar estilos

const API_URL = "http://localhost:3000/api"; // Ajusta al puerto correcto

const CalendarioReservas = () => {
  const [añoSeleccionado, setAñoSeleccionado] = useState("2024");
  const [mesSeleccionado, setMesSeleccionado] = useState("02");
  const [cabanas, setCabanas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Obtener datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Cargando datos...");
  
        const token = localStorage.getItem("authToken"); // OBTENER TOKEN DEL LOCALSTORAGE
  
        const [cabanasRes, reservasRes] = await Promise.all([
          fetch(`${API_URL}/cabins`, {
            headers: { Authorization: `Bearer ${token}` }, // ENVIAR TOKEN
          }).then((res) => res.json()),
  
          fetch(`${API_URL}/reservations/lista`, {
            headers: { Authorization: `Bearer ${token}` }, // ENVIAR TOKEN
          }).then((res) => res.json()),
        ]);
  
        console.log("✅ Cabañas obtenidas:", cabanasRes);
        console.log("✅ Reservas obtenidas:", reservasRes);
  
        if (!Array.isArray(cabanasRes)) setCabanas([]);
        else setCabanas(cabanasRes);
  
        if (!Array.isArray(reservasRes)) setReservas([]);
        else setReservas(reservasRes);
  
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [añoSeleccionado, mesSeleccionado]); // 🔹 Ahora se actualiza cuando cambias mes/año
  
  

  // Genera los días del mes seleccionado
  const diasDelMes = () => {
    const start = startOfMonth(new Date(añoSeleccionado, mesSeleccionado - 1));
    const end = endOfMonth(new Date(añoSeleccionado, mesSeleccionado - 1));
    return eachDayOfInterval({ start, end }).map((day) => ({
      dia: format(day, "d"),
      fecha: format(day, "yyyy-MM-dd"),
    }));
  };

  // Obtener iniciales del cliente
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "";
    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("");
  };

  // Filtrar reservas por mes y año seleccionados
  const reservasFiltradas = reservas.filter((reserva) => {
    const checkin = reserva.checkinDate.slice(0, 7);
    const checkout = reserva.checkoutDate.slice(0, 7);
    const mesAñoSeleccionado = `${añoSeleccionado}-${mesSeleccionado}`;
    
    return checkin === mesAñoSeleccionado || checkout === mesAñoSeleccionado || 
           (checkin < mesAñoSeleccionado && checkout > mesAñoSeleccionado);
  });

  // Mantener todas las cabañas en la tabla, incluso sin reservas
  const todasLasCabanas = cabanas.map((cabaña) => ({
    ...cabaña,
    reservas: reservasFiltradas.filter((reserva) => reserva.cabin._id === cabaña._id),
  }));

  // Abrir modal con información de la reserva
  const abrirModal = (reserva) => {
    setReservaSeleccionada(reserva);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setReservaSeleccionada(null);
  };

  // Cerrar modal con la tecla Esc
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        cerrarModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return <p>Cargando calendario...</p>;

  return (
    <div className="calendario-reserva-content">
            <div style={{ padding: "20px", overflowX: "auto" }}>
      <h2>Calendario de Reservas</h2>

      {/* Filtros de búsqueda */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o cabaña..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: "5px", width: "200px" }}
        />

        <select value={añoSeleccionado} onChange={(e) => setAñoSeleccionado(e.target.value)}>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
          <option value="01">Enero</option>
          <option value="02">Febrero</option>
          <option value="03">Marzo</option>
          <option value="04">Abril</option>
          <option value="05">Mayo</option>
          <option value="06">Junio</option>
          <option value="07">Julio</option>
          <option value="08">Agosto</option>
          <option value="09">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </select>
      </div>

      {/* Tabla del calendario */}
      <div className="calendario-container">
        <table className="calendario-tabla">
          <thead>
            <tr>
              <th>Alojamiento</th>
              {diasDelMes().map((dia) => (
                <th key={dia.fecha}>{dia.dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {todasLasCabanas
    .sort((a, b) => {
      const regex = /(\D+)(\d+)/; // Captura el tipo y número
      const [, tipoA, numA] = a.number.match(regex) || [];
      const [, tipoB, numB] = b.number.match(regex) || [];

      // Ordenar primero por tipo de alojamiento (alfabético)
      if (tipoA !== tipoB) return tipoA.localeCompare(tipoB);

      // Luego ordenar por número (de menor a mayor)
      return Number(numA) - Number(numB);
    })
    .map((cabaña) => (
      <tr key={cabaña._id}>
        <td className="cabaña-nombre">{` ${cabaña.number}`}</td>
        {diasDelMes().map((dia) => {
          const reserva = reservasFiltradas.find(
            (r) =>
              r.cabin._id === cabaña._id &&
              r.checkinDate.slice(0, 10) <= dia.fecha &&
              r.checkoutDate.slice(0, 10) >= dia.fecha
          );

          return (
            <td
              key={dia.fecha}
              className={
                reserva
                  ? reserva.checkinDate.slice(0, 10) === dia.fecha
                    ? "reserva-inicio"
                    : reserva.checkoutDate.slice(0, 10) === dia.fecha
                    ? "reserva-fin"
                    : "reserva-ocupada"
                  : ""
              }
              title={reserva ? `Cliente: ${reserva.client.name}` : ""}
              onClick={() => reserva && abrirModal(reserva)}
            >
              {reserva ? `${obtenerIniciales(reserva.client.name)} - ${reserva._id.slice(-4)}` : ""}
            </td>
          );
        })}
      </tr>
    ))}
</tbody>

          <tr>
              <th>Alojamiento</th>
              {diasDelMes().map((dia) => (
                <th key={dia.fecha}>{dia.dia}</th>
              ))}
            </tr>
        </table>
      </div>

{/* Modal de Información de Reserva */}
{reservaSeleccionada && (
  <div className="modal">
    <div className="modal-content">
      <h3>Detalles de la Reserva</h3>

      {/* Datos del Cliente */}
      <p><strong>Nombre del Cliente:</strong> {reservaSeleccionada.client.name}</p>
      <p><strong>Tipo de Documento:</strong> {reservaSeleccionada.clientDocumentType}</p>
      <p><strong>Número de Documento:</strong> {reservaSeleccionada.client.documentNumber}</p>
      <p><strong>Teléfono:</strong> {reservaSeleccionada.client.phone || "No registrado"}</p>
      <p><strong>Email:</strong> {reservaSeleccionada.client.email || "No registrado"}</p>

      {/* Detalles de la Cabaña */}
      <h4>Información de la Cabaña</h4>
      <p><strong>Nombre:</strong> {`${reservaSeleccionada.cabin.number}`}</p>
      <p><strong>Capacidad:</strong> {`Adultos: ${reservaSeleccionada.cabin.maxAdults}, Niños: ${reservaSeleccionada.cabin.maxChildren}`}</p>
      <p><strong>¿Tiene Jacuzzi?</strong> {reservaSeleccionada.cabin.hasHotTub ? "Sí" : "No"}</p>
      <p><strong>Estado:</strong> {reservaSeleccionada.cabin.status}</p>
      <p><strong>Precio por noche:</strong> {`${reservaSeleccionada.cabin.price} ${reservaSeleccionada.cabin.currency}`}</p>

      {/* Fechas y Duración de la Reserva */}
      <h4>Detalles de la Reserva</h4>
      <p><strong>Fecha de Check-in:</strong> {new Date(reservaSeleccionada.checkinDate).toLocaleDateString()}</p>
      <p><strong>Fecha de Check-out:</strong> {new Date(reservaSeleccionada.checkoutDate).toLocaleDateString()}</p>
      <p><strong>Noches Reservadas:</strong> {Math.ceil((new Date(reservaSeleccionada.checkoutDate) - new Date(reservaSeleccionada.checkinDate)) / (1000 * 60 * 60 * 24))} noches</p>

      {/* Información de Pago */}
      <h4>Información de Pago</h4>
      <p><strong>Método de Pago:</strong> {reservaSeleccionada.paymentMethod}</p>
      <p><strong>Origen del Pago:</strong> {reservaSeleccionada.paymentOrigin}</p>

      {/* Estado y Creación de la Reserva */}
      <h4>Estado y Registro</h4>
      <p><strong>Estado de la Reserva:</strong> {reservaSeleccionada.isHistorical ? "Histórica" : "Activa"}</p>
      <p><strong>Fecha de Creación:</strong> {new Date(reservaSeleccionada.createdAt).toLocaleString()}</p>
      <p><strong>Última Actualización:</strong> {new Date(reservaSeleccionada.updatedAt).toLocaleString()}</p>

      {/* Botón para cerrar */}
      <button onClick={cerrarModal}>Cerrar</button>
    </div>
  </div>
)}
    </div>
    </div>
  );
};

export default CalendarioReservas;
