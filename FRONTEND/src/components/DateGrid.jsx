import React from "react";
import dayjs from "dayjs";

const DateGrid = ({ dates, selectedCabins, isFullScreen, reservations, onReservationClick }) => {
  const coupleCabins = Array.from({ length: 10 }, (_, i) => `Couple ${i + 1}`);
  const familiarCabins = Array.from({ length: 10 }, (_, i) => `Familiar ${i + 1}`);
  const cabinas = selectedCabins === "Ambas" ? [...coupleCabins, ...familiarCabins] : selectedCabins === "Couple" ? coupleCabins : familiarCabins;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${dates.length + 1}, ${isFullScreen ? "150px" : "100px"})`,
        gap: isFullScreen ? "15px" : "10px",
        overflowX: "auto",
        backgroundColor: "#000",
        color: "#fff",
        width: "100%",
      }}
    >
      {/* Cabecera con fechas */}
      <div style={{ fontWeight: "bold", textAlign: "center" }}>Espacio</div>
      {dates.map((date, index) => (
        <div key={index} style={{ fontWeight: "bold", textAlign: "center" }}>
          {date.format("DD/MM")}
        </div>
      ))}

      {/* Filas para cada espacio de cabina */}
      {cabinas.map((cabina, index) => (
        <React.Fragment key={index}>
          <div style={{ fontWeight: "bold", textAlign: "center" }}>{cabina}</div>
          {dates.map((date, index) => {
            const reservation = reservations.find(
              (res) => res.space === cabina && res.date === date.format("DD/MM")
            );

            const status = reservation ? reservation.status : "free";

            return (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: isFullScreen ? "20px" : "10px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor:
                    status === "occupied"
                      ? "#4CAF50" // Verde para ocupado
                      : status === "reserved"
                      ? "#FFEB3B" // Amarillo para reservado
                      : "#333", // Gris para libre
                  color: status === "reserved" ? "#000" : "#fff", // Texto negro para reservado
                  fontSize: isFullScreen ? "16px" : "14px",
                  transition: "background-color 0.3s ease",
                }}
                onClick={() => onReservationClick(cabina, date)}
              >
                {status === "free" ? "+" : status === "reserved" ? "Reservado" : "Ocupado"}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DateGrid;