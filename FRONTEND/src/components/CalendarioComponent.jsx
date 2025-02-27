import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import CabinsSelector from "./CabinsSelector";
import DateGrid from "./DateGrid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarComponent.css";

dayjs.extend(isSameOrBefore);

const CalendarComponent = () => {
  const [selectedCabins, setSelectedCabins] = useState("Couple");
  const [dates, setDates] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reservations, setReservations] = useState([
    { id: 1, space: "Couple 1", date: "14/02", status: "reserved", clientName: "Juan Pérez" },
    { id: 2, space: "Familiar 1", date: "15/02", status: "occupied", clientName: "Maria Gómez" },
  ]);
  const [showDetails, setShowDetails] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [newReservation, setNewReservation] = useState({ space: "", date: "", status: "", clientName: "" });

  useEffect(() => {
    generateDates(selectedMonth);
  }, [selectedMonth]);

  const generateDates = (month) => {
    const initialDates = [];
    const startDate = month.startOf("month");
    const endDate = month.endOf("month");
    for (let i = 0; i < endDate.diff(startDate, "day") + 1; i++) {
      initialDates.push(startDate.add(i, "day"));
    }
    setDates(initialDates);
  };

  const handleReservationClick = (cabina, date) => {
    if (date.isSameOrBefore(dayjs(), "day")) {
      alert("No se pueden reservar fechas pasadas.");
      return;
    }

    const reservation = reservations.find(
      (res) => res.space === cabina && res.date === date.format("DD/MM")
    );

    if (reservation) {
      setReservationDetails(reservation);
      setShowDetails(true);
    } else {
      setNewReservation({ space: cabina, date: date.format("DD/MM"), status: "", clientName: "" });
      setShowDetails(true);
    }
  };

  const closeModal = () => {
    setShowDetails(false);
    setReservationDetails(null);
    setNewReservation({ space: "", date: "", status: "", clientName: "" });
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(dayjs(month));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedMonth(dayjs(date));
  };

  const handleReservationSubmit = () => {
    if (!newReservation.clientName || !newReservation.status) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const newReservationData = {
      id: reservations.length + 1,
      space: newReservation.space,
      date: newReservation.date,
      status: newReservation.status,
      clientName: newReservation.clientName,
    };

    setReservations([...reservations, newReservationData]);
    closeModal();
  };

  const generateMonthOptions = () => {
    const months = [];
    const today = dayjs();
    for (let i = -3; i <= 6; i++) {
      const month = today.add(i, "month");
      months.push(month);
    }
    return months;
  };

  return (
    <div>
      {/* Botón para expandir */}
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "5px 10px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          zIndex: 1000,
        }}
      >
        {isFullScreen ? "Reducir" : "Expandir"}
      </button>

      {/* Contenedor del calendario */}
      <div
        className="calendar-container"
        style={{
          backgroundColor: "#000",
          border: "2px solid #fff",
          padding: "20px",
          width: "calc(100% - 250px)",
          marginLeft: "250px",
          position: "relative",
        }}
      >
        <h1 style={{ color: "#fff" }}>Calendario de Reservas</h1>

        {/* Filtros */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#fff", marginRight: "10px" }}>Tipo de Cabina: </label>
          <select
            value={selectedCabins}
            onChange={(e) => setSelectedCabins(e.target.value)}
            style={{ padding: "5px", borderRadius: "5px" }}
          >
            <option value="Couple">Couple</option>
            <option value="Familiar">Familiar</option>
            <option value="Ambas">Ambas</option>
          </select>

          <label style={{ color: "#fff", marginLeft: "20px", marginRight: "10px" }}>Mes: </label>
          <select
            value={selectedMonth.format("YYYY-MM")}
            onChange={(e) => handleMonthChange(e.target.value)}
            style={{ padding: "5px", borderRadius: "5px" }}
          >
            {generateMonthOptions().map((month, index) => (
              <option key={index} value={month.format("YYYY-MM")}>
                {month.format("MMMM YYYY")}
              </option>
            ))}
          </select>

          <label style={{ color: "#fff", marginLeft: "20px", marginRight: "10px" }}>Buscar Fecha: </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecciona una fecha"
            className="date-picker"
          />
        </div>

        <DateGrid
          dates={dates}
          selectedCabins={selectedCabins}
          isFullScreen={false}
          reservations={reservations}
          onReservationClick={handleReservationClick}
        />
      </div>

      {/* Modal para detalles de reserva */}
      {showDetails && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{reservationDetails ? "Detalles de la Reserva" : "Nueva Reserva"}</h2>
            {reservationDetails ? (
              <>
                <p><strong>Cabina:</strong> {reservationDetails.space}</p>
                <p><strong>Fecha:</strong> {reservationDetails.date}</p>
                <p><strong>Estado:</strong> {reservationDetails.status}</p>
                <p><strong>Cliente:</strong> {reservationDetails.clientName}</p>
              </>
            ) : (
              <>
                <p><strong>Cabina:</strong> {newReservation.space}</p>
                <p><strong>Fecha:</strong> {newReservation.date}</p>
                <label>
                  Estado:
                  <select
                    value={newReservation.status}
                    onChange={(e) => setNewReservation({ ...newReservation, status: e.target.value })}
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="occupied">Ocupado</option>
                    <option value="reserved">Reservado</option>
                  </select>
                </label>
                <label>
                  Nombre del Cliente:
                  <input
                    type="text"
                    value={newReservation.clientName}
                    onChange={(e) => setNewReservation({ ...newReservation, clientName: e.target.value })}
                  />
                </label>
                <button onClick={handleReservationSubmit}>Guardar Reserva</button>
              </>
            )}
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Card Full Screen */}
      {isFullScreen && (
        <div
          className="full-screen-card"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#000",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Botón "X" para cerrar */}
          <button
            onClick={toggleFullScreen}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              fontSize: "24px",
              zIndex: 10000,
            }}
          >
            ×
          </button>

          {/* Contenedor interno para el contenido */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: "auto",
              padding: "20px",
            }}
          >
            <h2 style={{ color: "#fff" }}>Calendario de Reservas</h2>

            {/* Filtros */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#fff", marginRight: "10px" }}>Tipo de Cabina: </label>
              <select
                value={selectedCabins}
                onChange={(e) => setSelectedCabins(e.target.value)}
                style={{ padding: "5px", borderRadius: "5px" }}
              >
                <option value="Couple">Couple</option>
                <option value="Familiar">Familiar</option>
                <option value="Ambas">Ambas</option>
              </select>

              <label style={{ color: "#fff", marginLeft: "20px", marginRight: "10px" }}>Mes: </label>
              <select
                value={selectedMonth.format("YYYY-MM")}
                onChange={(e) => handleMonthChange(e.target.value)}
                style={{ padding: "5px", borderRadius: "5px" }}
              >
                {generateMonthOptions().map((month, index) => (
                  <option key={index} value={month.format("YYYY-MM")}>
                    {month.format("MMMM YYYY")}
                  </option>
                ))}
              </select>

              <label style={{ color: "#fff", marginLeft: "20px", marginRight: "10px" }}>Buscar Fecha: </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona una fecha"
                className="date-picker"
              />
            </div>

            <DateGrid
              dates={dates}
              selectedCabins={selectedCabins}
              isFullScreen={true}
              reservations={reservations}
              onReservationClick={handleReservationClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;