// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportsController');

// Obtener estadísticas generales
router.get('/stats', reportController.getStats);

// Obtener reservas con información detallada
router.get('/reservations', reportController.getReservations);

// Obtener datos para los gráficos
router.get('/chart-data', reportController.getChartData);

// Obtener tipos de cabañas disponibles
router.get('/cabin-types', reportController.getCabinTypes);

module.exports = router;