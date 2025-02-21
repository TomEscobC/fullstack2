const express = require("express");
const { registrarUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } = require("../controllers/registerController");

const router = express.Router();

router.post("/", registrarUsuario);  // Método para registrar un nuevo usuario.
router.get("/", obtenerUsuarios);    // Método para obtener todos los usuarios.
router.put("/:id", actualizarUsuario); // Método para actualizar un usuario por ID.
router.delete("/:id", eliminarUsuario); // Método para eliminar un usuario por ID.

module.exports = router;
