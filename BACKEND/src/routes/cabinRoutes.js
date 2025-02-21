const express = require("express");
const { obtenerCabanas, crearCabana, actualizarCabana, eliminarCabana } = require("../controllers/cabinController");

const router = express.Router();

router.get("/", obtenerCabanas);  // Método para obtener todas las cabañas.
router.post("/", crearCabana);    // Método para crear una nueva cabaña.
router.put("/:id", actualizarCabana); // Método para actualizar una cabaña por ID.
router.delete("/:id", eliminarCabana); // Método para eliminar una cabaña por ID.

module.exports = router;
