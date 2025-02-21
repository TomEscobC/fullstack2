const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../models/usersModels"); // Ajusta según tu modelo de usuario
const router = express.Router();

// Secret key para JWT
const SECRET_KEY = 'chlk';

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']; // Se espera que el token esté en el encabezado Authorization

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, no se proporcionó token' });
  }

  // Verifica el token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user; // Guarda la información del usuario en el request para las siguientes rutas
    next(); // Llama a la siguiente función (ruta protegida)
  });
}

// Ruta de inicio de sesión
router.post('/login', express.json(), async (req, res) => {
  const { username, password } = req.body;

  // Validación que se han rellenado los campos obligatorios
  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    // Encuentra al usuario
    const user = await User.findOne({ username });

    // Usuario no encontrado
    if (!user) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    // Verifica la contraseña
    const matchPass = await user.comparePassword(password);

    if (!matchPass) {
      return res.status(401).json({ message: 'Contraseña incorrecta, inténtelo de nuevo' });
    }

    // Crea un token JWT
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

// Rutas protegidas
router.get('/reportes', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido a los reportes', user: req.user });
});

router.get('/estado-cabañas', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido al estado de las cabañas', user: req.user });
});

router.get('/lista-cabañas', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido a la lista de cabañas', user: req.user });
});

router.post('/añadir-reservas', authenticateToken, (req, res) => {
  // Lógica para agregar reservas
  res.status(200).json({ message: 'Reserva añadida correctamente' });
});

router.get('/lista-reservas', authenticateToken, (req, res) => {
  // Lógica para mostrar lista de reservas
  res.status(200).json({ message: 'Acceso concedido a la lista de reservas', user: req.user });
});

router.post('/cerrar-sesion', authenticateToken, (req, res) => {
  // Lógica para cerrar sesión, puedes eliminar el token en el frontend
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;
