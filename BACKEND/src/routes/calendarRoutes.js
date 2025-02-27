const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservationModel");
const Cabin = require("../models/cabinModel");

// Obtener todas las reservas de un mes específico
router.get("/reservations/:month", async (req, res) => {
  const { month } = req.params;
  try {
    const reservations = await Reservation.find({ date: new RegExp(month) });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error });
  }
});

// Crear una nueva reserva
router.post("/reservations", async (req, res) => {
  try {
    const { space, date, status, clientName } = req.body;
    const newReservation = new Reservation({ space, date, status, clientName });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: "Error al crear reserva", error });
  }
});

// Actualizar el estado de una reserva
router.put("/reservations/:id", async (req, res) => {
  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar reserva", error });
  }
});

// Eliminar una reserva
router.delete("/reservations/:id", async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!deletedReservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar reserva", error });
  }
});

module.exports = router;
