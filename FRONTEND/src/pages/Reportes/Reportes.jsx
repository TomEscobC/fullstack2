import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Configura la URL base de la API
const API_BASE_URL = "http://localhost:3000/api";

// Tipos de habitación fijos
const ROOM_TYPES = [
  { value: "", label: "Todos los tipos" },
  { value: "TinyCabin", label: "Tiny Cabin" },
  { value: "Suite", label: "Suite" }
];

// Configurar interceptores de axios para mejor depuración
axios.interceptors.request.use(
  config => {
    console.log(`Realizando solicitud a: ${config.url}`);
    return config;
  },
  error => {
    console.error("Error en la solicitud:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log(`Respuesta de ${response.config.url}:`, response.data);
    return response;
  },
  error => {
    console.error(`Error en respuesta de ${error.config?.url}:`, 
                 error.response?.data || error.message);
    console.error("Código de estado:", error.response?.status);
    return Promise.reject(error);
  }
);

// Configura axios con el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  console.log("Token obtenido:", token ? "Token presente" : "Token no encontrado");
  
  // Asegurarse de que el token se envía exactamente como lo espera el servidor
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    }
  };
};

// Manejador de errores específico para la API de reportes
const handleReportApiError = (error, endpoint, setError) => {
  console.error(`Error en ${endpoint}:`, error);
  
  // Identificar problemas específicos de token
  if (error.response) {
    if (error.response.status === 403) {
      setError("⚠️ No tienes acceso a esta sección. Puede que tu sesión haya expirado.");
      console.log("Sugerencia: Intenta cerrar sesión y volver a iniciar sesión.");
      return;
    } else if (error.response.status === 401) {
      setError("⚠️ Se requiere autenticación para acceder a esta sección.");
      return;
    }
  }
  
  // Error genérico para otros problemas
  setError(`⚠️ Error al cargar datos de ${endpoint}. Intenta recargar la página.`);
};

// Función para verificar si el endpoint existe
const checkEndpoint = async (endpoint) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    console.log(`Endpoint ${endpoint} status:`, response.status);
    if (!response.ok) {
      console.error(`Endpoint ${endpoint} no disponible:`, await response.text());
    }
    return response.ok;
  } catch (error) {
    console.error(`Error verificando endpoint ${endpoint}:`, error);
    return false;
  }
};

const Reportes = () => {
  // Estados
  const [reservations, setReservations] = useState([]);
  const [cabinTypes, setCabinTypes] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReservations: 0,
    totalDays: 0,
    averageStay: 0,
    highestRevenueReservation: null,
  });
  const [chartData, setChartData] = useState({
    monthly: [],
    cabinTypes: [],
    status: []
  });
  const [filters, setFilters] = useState({
    month: "",
    cabinType: "",
    roomType: "",
    status: "",
    minDays: ""
  });
  const [selectedChart, setSelectedChart] = useState("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpointsChecked, setEndpointsChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Verificar endpoints al cargar el componente
  useEffect(() => {
    const verifyEndpoints = async () => {
      console.log("Verificando endpoints...");
      const endpoints = [
        "/reports/stats",
        "/reports/chart-data",
        "/reports/cabin-types",
        "/reports/reservations"
      ];
      
      const results = await Promise.all(endpoints.map(endpoint => checkEndpoint(endpoint)));
      
      // Si algún endpoint no está disponible, mostrar advertencia
      if (!results.every(result => result)) {
        setError("⚠️ Algunos endpoints no están disponibles. Por favor verifica la configuración del backend.");
      }
      
      setEndpointsChecked(true);
    };
    
    verifyEndpoints();
  }, []);

  // Columnas para la tabla
  const columns = useMemo(() => [
    {
      accessorKey: "client",
      header: "Cliente",
      cell: info => info.getValue(),
      sortable: true
    },
    {
      accessorKey: "clientDocumentType",
      header: "Tipo de Documento",
      cell: info => info.getValue(),
      sortable: true
    },
    {
      accessorKey: "clientDocumentNumber",
      header: "Número de Documento",
      cell: info => info.getValue(),
      sortable: true
    },
    {
      accessorKey: "checkinDate",
      header: "Check-in",
      cell: info => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      },
      sortable: true
    },
    {
      accessorKey: "checkoutDate",
      header: "Check-out",
      cell: info => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      },
      sortable: true
    },
    {
      accessorKey: "days",
      header: "Días",
      cell: info => info.getValue() || 'N/A',
      sortable: true
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: info => info.getValue() || 'N/A',
      sortable: true
    },
    {
      accessorKey: "cabin",
      header: "Cabina",
      cell: info => {
        const cabin = info.getValue();
        return cabin ? `${cabin.type || 'N/A'} - ${cabin.number || 'N/A'}` : 'N/A';
      },
      sortable: false
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: info => {
        const status = info.getValue() || 'N/A';
        let color;
        switch(status) {
          case 'histórica': color = '#FFC107'; break;
          case 'actual': color = '#4CAF50'; break;
          default: color = '#757575';
        }
        return <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.8rem'
        }}>{status}</span>;
      },
      sortable: true
    }
  ], []);

  // Función modificada para probar primero la disponibilidad
  const fetchChartData = useCallback(async () => {
    try {
      // Añadimos el filtro de tipo de habitación a la URL si está seleccionado
      let url = `${API_BASE_URL}/reports/chart-data`;
      if (filters.roomType) {
        url += url.includes('?') ? `&roomType=${filters.roomType}` : `?roomType=${filters.roomType}`;
      }
      
      console.log("Solicitando datos de gráficos desde:", url);
      const response = await axios.get(url, getAuthHeaders());
      
      // Verificar la estructura de los datos recibidos
      console.log("Datos de gráficos recibidos:", response.data);
      
      // Asegurarnos de que los datos tengan la estructura correcta
      const data = {
        monthly: Array.isArray(response.data.monthly) ? response.data.monthly : [],
        cabinTypes: Array.isArray(response.data.cabinTypes) ? response.data.cabinTypes : [],
        status: Array.isArray(response.data.status) ? response.data.status : []
      };
      
      setChartData(data);
    } catch (error) {
      handleReportApiError(error, "gráficos", setError);
    }
  }, [filters.roomType]);

  // Función para obtener las estadísticas
  const fetchStats = useCallback(async () => {
    try {
      // Añadimos el filtro de tipo de habitación a la URL si está seleccionado
      let url = `${API_BASE_URL}/reports/stats`;
      if (filters.roomType) {
        url += url.includes('?') ? `&roomType=${filters.roomType}` : `?roomType=${filters.roomType}`;
      }
      
      console.log("Solicitando estadísticas desde:", url);
      const response = await axios.get(url, getAuthHeaders());
      
      console.log("Estadísticas recibidas:", response.data);
      
      // Validar datos y aplicar valores predeterminados si es necesario
      const stats = {
        totalReservations: response.data.totalReservations || 0,
        totalDays: response.data.totalDays || 0,
        averageStay: response.data.averageStay || "0",
        highestRevenueReservation: response.data.highestRevenueReservation || null
      };
      
      setStatistics(stats);
    } catch (error) {
      handleReportApiError(error, "estadísticas", setError);
    }
  }, [filters.roomType]);

  // Función para obtener los tipos de cabañas
  const fetchCabinTypes = useCallback(async () => {
    try {
      console.log("Solicitando tipos de cabañas");
      const response = await axios.get(`${API_BASE_URL}/reports/cabin-types`, getAuthHeaders());
      
      console.log("Tipos de cabañas recibidos:", response.data);
      
      // Validar que sea un array
      if (Array.isArray(response.data)) {
        setCabinTypes(response.data);
      } else {
        console.warn("Los datos de tipos de cabañas no son un array:", response.data);
        setCabinTypes([]);
      }
    } catch (error) {
      console.error("Error fetching cabin types:", error);
      // No establecemos error aquí para no interrumpir toda la carga
      // Pero si dejamos cabinTypes como un array vacío para evitar errores
      setCabinTypes([]);
    }
  }, []);

  // Función para obtener las reservaciones con filtros
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let params = new URLSearchParams();
      if (filters.month) params.append("month", filters.month);
      if (filters.cabinType) params.append("cabinType", filters.cabinType);
      if (filters.roomType) params.append("roomType", filters.roomType);
      if (filters.status) params.append("status", filters.status);
      if (filters.minDays) params.append("minDays", filters.minDays);
      
      const url = `${API_BASE_URL}/reports/reservations${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Solicitando reservaciones desde:", url);
      
      const response = await axios.get(url, getAuthHeaders());
      
      console.log("Reservaciones recibidas:", response.data);
      
      // Validar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        setReservations(response.data);
      } else {
        console.warn("Los datos de reservaciones no son un array:", response.data);
        setReservations([]);
      }
      
      setError(null);
    } catch (error) {
      handleReportApiError(error, "reservaciones", setError);
      
      // Establecer reservations como array vacío para evitar errores
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar datos solo cuando los endpoints han sido verificados
  useEffect(() => {
    if (endpointsChecked) {
      const loadInitialData = async () => {
        setIsLoading(true);
        try {
          // Intentamos cargar los datos secuencialmente para mejor depuración
          try {
            await fetchStats();
          } catch (e) {
            console.error("Error en fetchStats:", e);
          }
          
          try {
            await fetchChartData();
          } catch (e) {
            console.error("Error en fetchChartData:", e);
          }
          
          try {
            await fetchCabinTypes();
          } catch (e) {
            console.error("Error en fetchCabinTypes:", e);
          }
          
          try {
            await fetchReservations();
          } catch (e) {
            console.error("Error en fetchReservations:", e);
          }
          
        } catch (error) {
          console.error("Error loading initial data:", error);
          setError("⚠️ Error cargando los datos iniciales. Verifica la consola para más detalles.");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadInitialData();
    }
  }, [endpointsChecked, fetchStats, fetchChartData, fetchCabinTypes, fetchReservations]);

  // Cuando cambia el tipo de habitación, actualizamos los datos de gráficos y estadísticas
  useEffect(() => {
    if (endpointsChecked) {
      fetchStats();
      fetchChartData();
    }
  }, [fetchStats, fetchChartData, filters.roomType, endpointsChecked]);

  // Cargar reservaciones cuando cambien los filtros
  useEffect(() => {
    if (endpointsChecked) {
      fetchReservations();
    }
  }, [fetchReservations, endpointsChecked]);

  // Almacenar preferencia de modo oscuro
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Configuración de la tabla
  const table = useReactTable({
    data: reservations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      }
    }
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const theme = {
    backgroundColor: darkMode ? "#1a1a1a" : "#fff",
    color: darkMode ? "#f0f0f0" : "#333",
    cardBg: darkMode ? "#333" : "#f4f4f4",
    borderColor: darkMode ? "#555" : "#ddd",
    buttonPrimary: darkMode ? "#4a90e2" : "#28a745",
    buttonSecondary: darkMode ? "#555" : "#f0f0f0",
    tableBg: darkMode ? "#333" : "#fff",
    tableHeaderBg: darkMode ? "#444" : "#f4f4f4",
    tableRowHover: darkMode ? "#444" : "#f9f9f9",
  };

  return (
    <div className="dashboard-container" style={{ 
      width: "90%", 
      maxWidth: "1200px",
      margin: "30px auto", 
      backgroundColor: theme.backgroundColor, 
      color: theme.color, 
      padding: "25px", 
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      marginLeft: "280px"
    }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>📊 Dashboard de Reservas</h1>
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            padding: "8px 12px",
            borderRadius: "5px",
            backgroundColor: theme.buttonSecondary,
            color: darkMode ? "#fff" : "#333",
            cursor: "pointer",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          {darkMode ? "🌞 Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </header>

      {/* Panel de filtros */}
      <section className="filters-panel" style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "25px",
        padding: "15px",
        backgroundColor: theme.cardBg,
        borderRadius: "8px"
      }}>
        {/* Filtro por mes */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label htmlFor="month-filter" style={{ display: "block", marginBottom: "5px" }}>Mes:</label>
          <select 
            id="month-filter"
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color
            }}
          >
            <option value="">Todos los meses</option>
            <option value="Enero">Enero</option>
            <option value="Febrero">Febrero</option>
            <option value="Marzo">Marzo</option>
            <option value="Abril">Abril</option>
            <option value="Mayo">Mayo</option>
            <option value="Junio">Junio</option>
            <option value="Julio">Julio</option>
            <option value="Agosto">Agosto</option>
            <option value="Septiembre">Septiembre</option>
            <option value="Octubre">Octubre</option>
            <option value="Noviembre">Noviembre</option>
            <option value="Diciembre">Diciembre</option>
          </select>
        </div>
        
        {/* Filtro por tipo de cabaña */}
        {/*<div style={{ flex: 1, minWidth: "200px" }}>
          <label htmlFor="cabin-type-filter" style={{ display: "block", marginBottom: "5px" }}>Tipo de Cabaña:</label>
          <select 
            id="cabin-type-filter"
            value={filters.cabinType}
            onChange={(e) => handleFilterChange("cabinType", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color
            }}
          >
            <option value="">Todos los tipos</option>
            {cabinTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>*/}
        
        {/* Filtro por tipo de habitación específico */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label htmlFor="room-type-filter" style={{ display: "block", marginBottom: "5px" }}>Tipo de cabaña:</label>
          <select 
            id="room-type-filter"
            value={filters.roomType}
            onChange={(e) => handleFilterChange("roomType", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color
            }}
          >
            {ROOM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro por estado */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label htmlFor="status-filter" style={{ display: "block", marginBottom: "5px" }}>Estado:</label>
          <select 
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color
            }}
          >
            <option value="">Todos los estados</option>
            <option value="histórica">Histórica</option>
            <option value="actual">Actual</option>
          </select>
        </div>
      </section>

      {/* Mensajes de depuración (visible solo durante desarrollo) */}
      {/*{process.env.NODE_ENV === 'development' && (
        <div style={{
          background: '#f8f9fa',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px dashed #ccc',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Debug Info:</h4>
          <p>Endpoints verificados: {endpointsChecked ? 'Sí' : 'No'}</p>
          <p>Token presente: {localStorage.getItem("authToken") ? 'Sí' : 'No'}</p>
          <p>Reservas cargadas: {reservations.length}</p>
          <p>Tipos de cabañas cargados: {cabinTypes.length}</p>
          <p>Datos de gráficos: 
            {chartData.monthly.length || 
             chartData.cabinTypes.length || 
             chartData.status.length ? 'Disponibles' : 'No disponibles'}</p>
        </div>
      )}*/}

      {/* Tarjetas de estadísticas */}
      <section className="statistics-cards" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px",
        marginBottom: "30px"
      }}>
        <StatCard 
          title="📊 Total Reservas" 
          value={statistics.totalReservations.toLocaleString()} 
          theme={theme}
        />
        <StatCard 
          title="🏨 Total Días de Estancia" 
          value={statistics.totalDays.toLocaleString()}
          theme={theme}
        />
        <StatCard 
          title="⏱️ Estancia Promedio" 
          value={`${statistics.averageStay} días`}
          theme={theme}
        />
        {statistics.highestRevenueReservation && (
          <StatCard 
            title="🏆 Estancia Más Larga" 
            value={
              `${new Date(statistics.highestRevenueReservation.checkinDate).toLocaleDateString()} - 
               ${new Date(statistics.highestRevenueReservation.checkoutDate).toLocaleDateString()}`
            }
            subvalue={`${statistics.highestRevenueReservation.dayCount} días`}
            theme={theme}
          />
        )}
      </section>

      {/* Selección de gráfico */}
      <section className="chart-controls" style={{ marginBottom: "20px" }}>
        <label htmlFor="chart-selector" style={{ marginRight: "10px" }}>📊 Tipo de Gráfico: </label>
        <select 
          id="chart-selector"
          onChange={(e) => setSelectedChart(e.target.value)} 
          value={selectedChart}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: `1px solid ${theme.borderColor}`,
            backgroundColor: theme.backgroundColor,
            color: theme.color
          }}
        >
          <option value="bar">Estadía Mensual</option>
          <option value="pie">Distribución por Tipo de Cabaña</option>
          <option value="line">Tendencia de Reservas</option>
          <option value="status">Estado de Reservas</option>
        </select>
      </section>

      {/* Visualización de gráficos */}
      <section className="chart-display" style={{ 
        backgroundColor: theme.cardBg, 
        padding: "20px", 
        borderRadius: "8px",
        marginBottom: "30px",
        minHeight: "400px" // Asegurar altura mínima para gráficos
      }}>
        {isLoading ? (
          <LoadingIndicator theme={theme} />
        ) : error ? (
          <ErrorMessage error={error} theme={theme} />
        ) : (
          <>
            {selectedChart === "bar" && (
              chartData.monthly && chartData.monthly.length > 0 ? (
                <BarChartComponent data={chartData.monthly} theme={theme} />
              ) : (
                <NoDataMessage theme={theme} type="gráfico de barras" />
              )
            )}
            {selectedChart === "pie" && (
              chartData.cabinTypes && chartData.cabinTypes.length > 0 ? (
                <PieChartComponent data={chartData.cabinTypes} theme={theme} />
              ) : (
                <NoDataMessage theme={theme} type="gráfico de torta" />
              )
            )}
            {selectedChart === "line" && (
              chartData.monthly && chartData.monthly.length > 0 ? (
                <LineChartComponent data={chartData.monthly} theme={theme} />
              ) : (
                <NoDataMessage theme={theme} type="gráfico de línea" />
              )
            )}
            {selectedChart === "status" && (
              chartData.status && chartData.status.length > 0 ? (
                <StatusChartComponent data={chartData.status} theme={theme} />
              ) : (
                <NoDataMessage theme={theme} type="gráfico de estado" />
              )
            )}
          </>
        )}
      </section>

      {/* Tabla completa */}
      <section className="data-table-section">
        <h2 style={{ marginBottom: "15px" }}>📑 Datos de Reservas</h2>
        <TableComponent table={table} theme={theme} />
      </section>
    </div>
  );
};

// Componente para mostrar mensaje de no datos
const NoDataMessage = ({ theme, type }) => (
  <div style={{ 
    display: "flex", 
    flexDirection: "column",
    alignItems: "center", 
    justifyContent: "center", 
    height: "300px",
    color: theme.color,
    opacity: 0.7
  }}>
    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
    <p style={{ fontSize: "1.2rem" }}>No hay datos disponibles para {type}</p>
    <p>Intenta cambiar los filtros o verifica que haya datos en el sistema.</p>
  </div>
);

// Componente de Tarjeta Estadística
const StatCard = ({ title, value, subvalue, theme }) => (
  <div style={{ 
    backgroundColor: theme.cardBg, 
    padding: "20px", 
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease"
  }}>
    <h3 style={{ fontSize: "1.1rem", marginTop: 0, marginBottom: "10px" }}>{title}</h3>
    <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0 }}>{value}</p>
    {subvalue && <p style={{ fontSize: "1rem", opacity: 0.8, marginTop: "5px" }}>{subvalue}</p>}
  </div>
);

// Componente de Indicador de Carga
const LoadingIndicator = ({ theme }) => (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <div style={{ 
      fontSize: "1.5rem", 
      fontWeight: "bold",
      color: theme.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px"
          }}>
      <span style={{ 
        display: "inline-block", 
        animation: "spin 1.5s linear infinite"
      }}>⏳</span>
      Cargando datos...
    </div>
  </div>
);

// Componente de Mensaje de Error
const ErrorMessage = ({ error, theme }) => (
  <div style={{ 
    textAlign: "center", 
    padding: "40px 0", 
    color: "#ff6b6b" 
  }}>
    <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{error}</p>
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: "8px 15px",
          borderRadius: "5px",
          backgroundColor: theme.buttonPrimary,
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        🔄 Reintentar
      </button>
      {(error.includes("sesión") || error.includes("autenticación") || error.includes("acceso")) && (
        <button 
          onClick={() => window.location.href = "/login"}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          🔑 Ir al Login
        </button>
      )}
    </div>
  </div>
);

// Gráfico de Barras - Días de estancia mensuales
const BarChartComponent = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} />
      <XAxis 
        dataKey="month" 
        tick={{ fill: theme.color }}
        angle={-45}
        textAnchor="end"
        interval={0}
        height={70}
      />
      <YAxis tick={{ fill: theme.color }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: theme.cardBg, 
          color: theme.color,
          border: `1px solid ${theme.borderColor}`
        }}
        formatter={(value) => [`${value} días`, "Estadía Total"]}
      />
      <Legend formatter={(value) => <span style={{ color: theme.color }}>{value}</span>} />
      <Bar 
        dataKey="days" 
        name="Días de Estadía" 
        fill="#8884d8" 
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);

// Gráfico de Torta - Distribución por Tipo de Cabaña
const PieChartComponent = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie 
        data={data} 
        dataKey="count" 
        nameKey="name" 
        cx="50%" 
        cy="50%" 
        outerRadius={150}
        fill="#8884d8" 
        labelLine={true}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: theme.cardBg, 
          color: theme.color,
          border: `1px solid ${theme.borderColor}`
        }}
        formatter={(value) => [`${value} reservas`, "Cantidad"]}
      />
      <Legend formatter={(value) => <span style={{ color: theme.color }}>{value}</span>} />
    </PieChart>
  </ResponsiveContainer>
);

// Gráfico de Línea - Tendencia de Reservas
const LineChartComponent = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} />
      <XAxis 
        dataKey="month" 
        tick={{ fill: theme.color }}
        angle={-45}
        textAnchor="end"
        interval={0}
        height={70}
      />
      <YAxis tick={{ fill: theme.color }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: theme.cardBg, 
          color: theme.color,
          border: `1px solid ${theme.borderColor}`
        }}
      />
      <Legend formatter={(value) => <span style={{ color: theme.color }}>{value}</span>} />
      <Line 
        type="monotone" 
        dataKey="count" 
        name="Cantidad de Reservas" 
        stroke="#8884d8" 
        strokeWidth={2}
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

// Gráfico de Estado de Reservas
const StatusChartComponent = ({ data, theme }) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie 
        data={data} 
        dataKey="value" 
        nameKey="name" 
        cx="50%" 
        cy="50%" 
        outerRadius={150}
        fill="#8884d8" 
        labelLine={true}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => {
          let color;
          switch(entry.name) {
            case 'Histórica': color = '#FFC107'; break;
            case 'Actual': color = '#4CAF50'; break;
            default: color = COLORS[index % COLORS.length];
          }
          return <Cell key={`cell-${index}`} fill={color} />;
        })}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: theme.cardBg, 
          color: theme.color,
          border: `1px solid ${theme.borderColor}`
        }}
        formatter={(value) => [value, "Reservas"]}
      />
      <Legend formatter={(value) => <span style={{ color: theme.color }}>{value}</span>} />
    </PieChart>
  </ResponsiveContainer>
);

// Componente de Tabla
const TableComponent = ({ table, theme }) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const exportToCSV = useCallback(() => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += table.getHeaderGroups().map(headerGroup =>
        headerGroup.headers.map(header => `"${header.column.columnDef.header}"`).join(",")
      ).join("\n") + "\n";
      csvContent += table.getRowModel().rows.map(row =>
        row.getVisibleCells().map(cell => {
          // Manejar valores especiales para evitar errores en el CSV
          const value = cell.getValue();
          if (value === null || value === undefined) return '""';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reservas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error al exportar datos. Inténtalo de nuevo.");
    }
  }, [table]);

  return (
    <div style={{ backgroundColor: theme.tableBg, borderRadius: "8px", padding: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Buscar reservas..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              table.setGlobalFilter?.(e.target.value);
            }}
            aria-label="Buscar en tabla de reservas"
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "5px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color,
            }}
          />
        </div>
        <button
          onClick={exportToCSV}
          aria-label="Exportar datos a CSV"
          style={{
            padding: "10px 15px",
            backgroundColor: theme.buttonPrimary,
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📥 Exportar a CSV
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table 
          style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            border: `1px solid ${theme.borderColor}`,
            borderRadius: "8px",
            overflow: "hidden"
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ backgroundColor: theme.tableHeaderBg }}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    style={{ 
                      padding: "12px", 
                      textAlign: "left",
                      color: theme.color,
                      borderBottom: `2px solid ${theme.borderColor}`,
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none"
                    }}
                    onClick={header.column.getToggleSortingHandler?.()}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === "asc" ? " 🔼" : " 🔽"
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id}
                  style={{ 
                    borderBottom: `1px solid ${theme.borderColor}`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td 
                      key={cell.id} 
                      style={{ 
                        padding: "12px",
                        color: theme.color,
                        transition: "background-color 0.2s ease" 
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={table.getAllColumns().length}
                  style={{ 
                    padding: "20px", 
                    textAlign: "center",
                    color: theme.color, 
                  }}
                >
                  No se encontraron datos con los filtros actuales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginTop: "15px", 
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div>
          <span style={{ marginRight: "10px" }}>Filas por página:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: `1px solid ${theme.borderColor}`,
              backgroundColor: theme.backgroundColor,
              color: theme.color
            }}
          >
            {[5, 10, 20, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: theme.buttonSecondary,
              color: theme.color,
              cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
              border: "none",
              opacity: table.getCanPreviousPage() ? 1 : 0.5
            }}
          >
            ⏮️ Primera
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: theme.buttonSecondary,
              color: theme.color,
              cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
              border: "none",
              opacity: table.getCanPreviousPage() ? 1 : 0.5
            }}
          >
            ⬅️ Anterior
          </button>
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: theme.buttonSecondary,
              color: theme.color,
              cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
              border: "none",
              opacity: table.getCanNextPage() ? 1 : 0.5
            }}
          >
            Siguiente ➡️
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: theme.buttonSecondary,
              color: theme.color,
              cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
              border: "none",
              opacity: table.getCanNextPage() ? 1 : 0.5
            }}
          >
            Última ⏭️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;