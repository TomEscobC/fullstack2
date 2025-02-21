import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./Reportes.css";

const Reportes = () => {
  const chartRefs = useRef({});

  useEffect(() => {
    const createChart = (canvasId, type, data, options) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      if (chartRefs.current[canvasId]) {
        chartRefs.current[canvasId].destroy();
      }

      chartRefs.current[canvasId] = new Chart(canvas, { type, data, options });
    };

    createChart("chartReservasMes", "bar", {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      datasets: [{ label: "Reservas por Mes", data: [12, 15, 8, 20, 18, 10], backgroundColor: "rgba(54, 162, 235, 0.5)" }]
    }, { responsive: true, maintainAspectRatio: false });

    createChart("chartTopHabitaciones", "doughnut", {
      labels: ["Suite 01", "Tainy 11", "Suite 05"],
      datasets: [{ data: [15, 12, 8], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"] }]
    }, { responsive: true, maintainAspectRatio: false });

    createChart("chartTendenciaReservas", "line", {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
      datasets: [{ label: "Tendencia de Reservas", data: [30, 45, 40, 60], borderColor: "#4e73df", backgroundColor: "rgba(78, 115, 223, 0.1)", fill: true, tension: 0.4 }]
    }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } });

    createChart("chartReservasPorTipo", "bar", {
      labels: ["Suite", "Tainy Cabin", "Familiar"],
      datasets: [{ label: "Reservas por Tipo", data: [45, 30, 25], backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"] }]
    }, { indexAxis: "y", responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } });

    return () => {
      Object.values(chartRefs.current).forEach(chart => chart.destroy());
    };
  }, []);

  const reservas = [
    { habitacion: "Suite 01", cliente: "Juan Pérez", fecha: "2024-03-15", estado: "Confirmada" },
    { habitacion: "Tainy 11", cliente: "María Gómez", fecha: "2024-03-16", estado: "Pendiente" },
    { habitacion: "Suite 05", cliente: "Carlos López", fecha: "2024-03-17", estado: "Cancelada" }
  ];

  return (
    <div className="reportes-container">
      <h1 className="text-center">Reportes de Reservas</h1>
      <div className="chart-container"><canvas id="chartReservasMes"></canvas></div>
      <div className="chart-container"><canvas id="chartTopHabitaciones"></canvas></div>
      <div className="chart-container"><canvas id="chartTendenciaReservas"></canvas></div>
      <div className="chart-container"><canvas id="chartReservasPorTipo"></canvas></div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Habitación</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva, index) => (
            <tr key={index}>
              <td>{reserva.habitacion}</td>
              <td>{reserva.cliente}</td>
              <td>{reserva.fecha}</td>
              <td>{reserva.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reportes;