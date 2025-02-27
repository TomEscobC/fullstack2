const Reservation = require('../models/reservationModels');
const Cabin = require('../models/cabinModels');
const Client = require('../models/clientModels');

// Obtener estadísticas generales
exports.getStats = async (req, res) => {
  try {
    // Construir consulta base
    let query = {};
    
    // Aplicar filtro por tipo de habitación si se proporciona
    if (req.query.roomType) {
      // Primero obtenemos todas las cabañas del tipo específico
      const cabins = await Cabin.find({ type: req.query.roomType });
      if (cabins.length > 0) {
        query.cabin = { $in: cabins.map(cabin => cabin._id) };
      }
    }
    
    // Obtener todas las reservas con los filtros aplicados
    const reservations = await Reservation.find(query)
      .populate('client')
      .populate('cabin');
    
    // Cálculo de estadísticas básicas
    const totalReservations = reservations.length;
    
    let totalDays = 0;
    let highestDays = 0;
    let highestRevenueReservation = null;
    
    reservations.forEach(reservation => {
      const checkin = new Date(reservation.checkinDate);
      const checkout = new Date(reservation.checkoutDate);
      const days = Math.ceil(Math.abs(checkout - checkin) / (1000 * 60 * 60 * 24));
      
      totalDays += days;
      
      // Encontrar la estancia más larga
      if (days > highestDays) {
        highestDays = days;
        highestRevenueReservation = {
          ...reservation.toObject(),
          dayCount: days
        };
      }
    });
    
    const averageStay = totalReservations > 0 ? (totalDays / totalReservations).toFixed(1) : 0;
    
    // Estadísticas por tipo de cabaña
    const cabinTypeStats = {};
    for (const reservation of reservations) {
      if (reservation.cabin?.type) {
        const type = reservation.cabin.type;
        if (!cabinTypeStats[type]) {
          cabinTypeStats[type] = {
            count: 0
          };
        }
        
        cabinTypeStats[type].count += 1;
      }
    }
    
    // Estadísticas por estado de reserva (isHistorical)
    const statusStats = {
      'histórica': 0,
      'actual': 0
    };
    
    for (const reservation of reservations) {
      const status = reservation.isHistorical ? 'histórica' : 'actual';
      statusStats[status] += 1;
    }
    
    res.json({
      totalReservations,
      totalDays,
      averageStay,
      highestRevenueReservation,
      cabinTypeStats,
      statusStats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Obtener reservas con información detallada
exports.getReservations = async (req, res) => {
  try {
    const { month, cabinType, roomType, status, minDays } = req.query;
    
    // Construir la consulta base
    let query = {};
    
    // Filtro por mes
    if (month) {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex !== -1) {
        const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
        const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);
        
        query.checkinDate = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }
    
    // Filtro por estado histórico
    if (status === 'histórica') {
      query.isHistorical = true;
    } else if (status === 'actual') {
      query.isHistorical = false;
    }
    
    // Procesamos los filtros relacionados con cabañas
    let cabinFilters = {};
    
    if (cabinType) {
      cabinFilters.type = cabinType;
    }
    
    // Filtrar por tipo de habitación específico
    if (roomType) {
      cabinFilters.type = roomType; // Filtra por "Suite" o "TinyCabin"
    }
    
    // Si hay filtros de cabaña, los aplicamos
    if (Object.keys(cabinFilters).length > 0) {
      const cabins = await Cabin.find(cabinFilters);
      // Si no hay cabañas que coincidan, devolvemos array vacío
      if (cabins.length === 0) {
        return res.json([]);
      }
      query.cabin = { $in: cabins.map(cabin => cabin._id) };
    }
    
    // Buscar reservaciones con los filtros aplicados
    const reservations = await Reservation.find(query)
      .populate('client')
      .populate('cabin');
    
    // Aplicar filtro de días mínimos (post-query)
    let filteredReservations = reservations;
    if (minDays) {
      const minDaysValue = parseInt(minDays);
      filteredReservations = reservations.filter(reservation => {
        const checkin = new Date(reservation.checkinDate);
        const checkout = new Date(reservation.checkoutDate);
        const days = Math.ceil(Math.abs(checkout - checkin) / (1000 * 60 * 60 * 24));
        return days >= minDaysValue;
      });
    }
    
    // Transformar los datos para el cliente
    const formattedReservations = filteredReservations.map(reservation => {
      const checkin = new Date(reservation.checkinDate);
      const checkout = new Date(reservation.checkoutDate);
      const days = Math.ceil(Math.abs(checkout - checkin) / (1000 * 60 * 60 * 24));
      
      return {
        _id: reservation._id,
        client: reservation.client?.name || 'Cliente no disponible',
        clientDocumentType: reservation.clientDocumentType || 'N/A',
        clientDocumentNumber: reservation.client?.documentNumber || 'N/A',
        checkinDate: reservation.checkinDate,
        checkoutDate: reservation.checkoutDate,
        paymentMethod: reservation.paymentMethod || 'N/A',
        cabin: {
          type: reservation.cabin?.type || 'N/A',
          number: reservation.cabin?.number || 'N/A'
        },
        status: reservation.isHistorical ? 'histórica' : 'actual',
        // Datos calculados
        days,
        adults: reservation.adults,
        children: reservation.children
      };
    });
    
    res.json(formattedReservations);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
};

// Obtener datos para los gráficos
exports.getChartData = async (req, res) => {
  try {
    // Construir consulta base
    let query = {};
    
    // Aplicar filtro por tipo de habitación si se proporciona
    if (req.query.roomType) {
      // Primero obtenemos todas las cabañas del tipo específico
      const cabins = await Cabin.find({ type: req.query.roomType });
      if (cabins.length > 0) {
        query.cabin = { $in: cabins.map(cabin => cabin._id) };
      }
    }
    
    const reservations = await Reservation.find(query)
      .populate('cabin');
    
    // Datos mensuales
    const monthlyData = {};
    for (const reservation of reservations) {
      if (reservation.checkinDate) {
        const date = new Date(reservation.checkinDate);
        const month = date.toLocaleString('default', { month: 'long' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            count: 0,
            days: 0
          };
        }
        
        const checkin = new Date(reservation.checkinDate);
        const checkout = new Date(reservation.checkoutDate);
        const days = Math.ceil(Math.abs(checkout - checkin) / (1000 * 60 * 60 * 24));
        
        monthlyData[month].count += 1;
        monthlyData[month].days += days;
      }
    }
    
    // Datos por tipo de cabaña
    const cabinTypeData = {};
    for (const reservation of reservations) {
      if (reservation.cabin?.type) {
        const type = reservation.cabin.type;
        if (!cabinTypeData[type]) {
          cabinTypeData[type] = {
            name: type,
            count: 0,
            days: 0
          };
        }
        
        const checkin = new Date(reservation.checkinDate);
        const checkout = new Date(reservation.checkoutDate);
        const days = Math.ceil(Math.abs(checkout - checkin) / (1000 * 60 * 60 * 24));
        
        cabinTypeData[type].count += 1;
        cabinTypeData[type].days += days;
      }
    }
    
    // Datos por estado (histórico vs actual)
    const statusData = [
      { name: "Histórica", value: 0 },
      { name: "Actual", value: 0 }
    ];
    
    for (const reservation of reservations) {
      if (reservation.isHistorical) {
        statusData[0].value += 1;
      } else {
        statusData[1].value += 1;
      }
    }
    
    res.json({
      monthly: Object.values(monthlyData),
      cabinTypes: Object.values(cabinTypeData),
      status: statusData
    });
  } catch (error) {
    console.error('Error al obtener datos para gráficos:', error);
    res.status(500).json({ message: 'Error al obtener datos para gráficos', error: error.message });
  }
};

// Obtener tipos de cabañas disponibles
exports.getCabinTypes = async (req, res) => {
  try {
    const cabins = await Cabin.find().distinct('type');
    res.json(cabins);
  } catch (error) {
    console.error('Error al obtener tipos de cabañas:', error);
    res.status(500).json({ message: 'Error al obtener tipos de cabañas', error: error.message });
  }
};