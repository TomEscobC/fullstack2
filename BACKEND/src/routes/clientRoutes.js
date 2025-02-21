const express = require("express");
const {  crearCliente, actualizarCliente, eliminarCliente , obtenerClientePorDocumento } = require("../controllers/clientController");

const router = express.Router();


router.post("/", crearCliente);    // Crear un nuevo cliente
router.put("/:id", actualizarCliente); // Actualizar un cliente por ID
router.delete("/:id", eliminarCliente); // Eliminar un cliente por ID
router.get("/", obtenerClientePorDocumento); // Buscar cliente por número de documento

module.exports = router;
