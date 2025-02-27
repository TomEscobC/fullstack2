// Este archivo podría estar vacío si los reportes no necesitan un modelo específico,
// ya que utilizan datos de otros modelos (reservations, cabins, clients).
// Sin embargo, si necesitas crear esquemas para reportes específicos o datos agregados
// que se guardan en la base de datos, puedes hacerlo aquí.

const mongoose = require('mongoose');

// Si necesitas un modelo de reporte, puedes crearlo así:
/*
const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalReservations: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageStay: {
    type: Number,
    default: 0
  },
  cabinStats: {
    type: Map,
    of: {
      count: Number,
      revenue: Number
    }
  },
  statusStats: {
    type: Map,
    of: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
*/

// Por ahora, exportamos un objeto vacío ya que no tenemos un modelo específico
module.exports = {};