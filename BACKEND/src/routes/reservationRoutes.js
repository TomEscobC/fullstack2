const express = require("express");
const { obtenerReservas, obtenerReservasConDetalles, crearReserva, actualizarReserva, eliminarReserva } = require("../controllers/reservationController");

const router = express.Router();

router.get("/", obtenerReservas);  // Obtener todas las reservas
router.post("/", crearReserva);    // Crear una nueva reserva
router.put("/:id", actualizarReserva); // Actualizar una reserva por ID
router.delete("/:id", eliminarReserva); // Eliminar una reserva por ID
router.get("/lista", obtenerReservasConDetalles); // listar reservas

module.exports = router;
