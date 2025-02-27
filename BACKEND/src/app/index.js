require("dotenv").config();
const express = require("express");
const cors = require("cors");  // Asegúrate de importar cors
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Módulo bcrypt para el hash de los datos de register
const conectarDB = require("../config/db");  // Asegúrate de que la ruta sea correcta
const session = require('express-session'); // Importa express-session para gestionar el inicio de usuario
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken para gestionar JWT

// Rutas de cliente, cabaña, Reserva
const clientRoutes = require("../routes/clientRoutes");
const cabinRoutes = require("../routes/cabinRoutes");
const reservationRoutes = require("../routes/reservationRoutes");
const registerRoutes = require("../routes/registerRoutes");
const loginRoutes = require("../controllers/loginController");


const app = express();

// Configuración de CORS
app.use(cors({
  origin: "http://localhost:5173",  // Cambia esto a la URL de tu frontend
  methods: ["GET", "POST", "PUT", "DELETE"],  // Los métodos que tu frontend puede usar
  allowedHeaders: ["Content-Type", "Authorization"],  // Asegúrate de permitir 'Authorization'
}));

// Conectar a la base de datos
conectarDB();

// Middleware
app.use(express.json());

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware para autenticar JWT
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Recupera el token
  
    console.log("Token recibido:", token);  // Verifica el token
  
    if (!token) {
      return res.status(401).json({ message: 'Falta el token de autenticación' });
    }
    try {
        jwt.verify(token, process.env.SECRET_KEY || 'chlk', (err, user) => {
            if (err) {
                throw new Error("Error")
              
            }
            console.log("Token verificado:", user);  // Verifica la información del usuario decodificada
            req.user = user;
            
          } );
          next();
    } catch (error) {
        return res.status(403).json({ message: 'Token no válido' });
        console.log(error)
    }
    
  }
  

app.use("/api/auth", loginRoutes);  // Ruta para el login

app.use("/api", authenticateToken);  // Usar authenticateToken para proteger las rutas

// Rutas con prefijo /api/
app.use("/api/clients", clientRoutes);  // Ruta para clientes
app.use("/api/cabins", cabinRoutes);  // Ruta para cabañas
app.use("/api/reservations", reservationRoutes);  // Ruta para reservas
app.use("/api/register", registerRoutes); // Ruta para crear usuarios


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
