import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AñadirReservas.css";

function AñadirReservas() {
  const formRef = useRef(null);
  const [rutError, setRutError] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [nacionalidadCliente, setNacionalidadCliente] = useState(""); 
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [canalOrigen, setCanalOrigen] = useState("");
  const [estado, setEstado] = useState("");
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);
  const [hasHotTub, setHasHotTub] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Crédito");
  const [paymentOrigin, setPaymentOrigin] = useState("Nacional");
  const [clientDocumentType, setClientDocumentType] = useState("RUT");
  const [clientDocumentNumber, setClientDocumentNumber] = useState("");
  const [newClientId, setNewClientId] = useState(null);

  useEffect(() => {
    const fetchCabanas = async () => {
      const token = localStorage.getItem("authToken"); // Obtén el token del localStorage
    console.log(token)
      if (token) {
        try {
          const response = await fetch("http://localhost:3000/api/cabins", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,  // Agregar el token aquí
            },
          });
    
          if (!response.ok) {
            throw new Error("Error al obtener las cabañas");
          }
    
          const data = await response.json();
          console.log("Datos de cabañas:", data);
          setHabitaciones(data);  // Guarda las cabañas en el estado
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("No se encontró el token de autenticación.");
      }
    };
    

    fetchCabanas();
  }, []);

  const handleReset = (event) => {
    event.preventDefault();
    if (formRef.current) {
      formRef.current.reset();
      setRutCliente("");
      setRutError("");
      setNombreCliente("");
      setTelefonoCliente("");
      setEmailCliente("");
      setNacionalidadCliente("");
      setHabitacionSeleccionada("");
      setFechaEntrada("");
      setFechaSalida("");
      setCanalOrigen("");
      setEstado("");
      setAdultos(1);
      setNinos(0);
      setHasHotTub(false);
      setPaymentMethod("Crédito");
      setPaymentOrigin("Nacional");
      setClientDocumentType("RUT");
      setClientDocumentNumber("");
    }
  };

  const formatRut = (value) => {
    let cleaned = value.replace(/[^0-9kK.-]/g, "");
    const numericOnly = cleaned.replace(/[^0-9kK]/g, "");
    if (numericOnly.length === 9) {
      let formattedRut =
        numericOnly.slice(0, 2) +
        "." +
        numericOnly.slice(2, 5) +
        "." +
        numericOnly.slice(5, 8) +
        "-" +
        numericOnly.slice(8).toUpperCase();
      return formattedRut;
    } else {
      return cleaned.toUpperCase();
    }
  };

  const handleRutChange = (event) => {
    const value = event.target.value;
    const formattedValue = formatRut(value);
    setRutCliente(formattedValue);
    if (formattedValue.length > 0 && formattedValue.length < 9) {
      setRutError("Ingrese su Rut, sin puntos ni guión.");
    } else {
      setRutError("");
    }
  };

  const handleClientDocumentNumber = (event) => {
    setClientDocumentNumber(event.target.value);
  };

  const handleNacionalidadChange = (event) => {
    setNacionalidadCliente(event.target.value);
  };

  const createClient = async () => {
    const clientData = {
      documentType: clientDocumentType,
      documentNumber: clientDocumentNumber.replace(/[^0-9kK]/g, ""),
      name: nombreCliente,
      phone: telefonoCliente,
      email: emailCliente,
      nationality: nacionalidadCliente,
    };
  
    // Recuperamos el token de localStorage
    const token = localStorage.getItem("authToken");
  
    if (token) {
      try {
        // Primero, buscamos si el cliente ya existe por su número de documento
        const existingClient = await fetch(
          `http://localhost:3000/api/clients?documentNumber=${clientData.documentNumber}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,  // Añadimos el token en los encabezados
            },
          }
        );
        const existingClientData = await existingClient.json();
  
        console.log('Datos obtenidos del backend:', existingClientData);
  
        if (existingClientData && existingClientData._id) {
          // Si el cliente ya existe, retornamos la ID del cliente existente
          console.log("Cliente ya existe:", existingClientData);
          return existingClientData._id;  // Usamos la ID del cliente existente
        } else {
          // Si el cliente no existe, lo creamos
          const response = await fetch("http://localhost:3000/api/clients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,  // Añadimos el token en los encabezados también para el POST
            },
            body: JSON.stringify(clientData),
          });
  
          const result = await response.json();
          if (response.ok) {
            console.log("Nuevo cliente creado:", result);
            return result._id;  // Usamos la ID del nuevo cliente creado
          } else {
            alert(result.message || "Error al crear el cliente");
            return null;
          }
        }
      } catch (error) {
        console.error("Error al crear o buscar cliente:", error);
        alert("Error en la conexión con el servidor");
        return null;
      }
    } else {
      console.error("No token found!");
      alert("No se encontró el token de autenticación.");
      return null;
    }
  };
  
  
  const createReservation = async (clientId) => {
    const reservaData = {
      client: clientId,
      clientDocumentType: clientDocumentType,
      clientDocumentNumber: clientDocumentNumber.replace(/[^0-9kK]/g, ""),
      checkinDate: fechaEntrada,
      checkoutDate: fechaSalida,
      adults: adultos,
      children: ninos,
      hasHotTub: hasHotTub,
      paymentMethod: paymentMethod,
      paymentOrigin: paymentOrigin,
      isHistorical: estado === "Confirmada" ? true : false,
      cabin: habitacionSeleccionada,
    };
  
    // Obtener el token de localStorage
    const token = localStorage.getItem("authToken");  // Recuperamos el token
  
    if (token) {
      try {
        const response = await fetch("http://localhost:3000/api/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  // Enviar el token en el encabezado
          },
          body: JSON.stringify(reservaData),  // Los datos de la reserva
        });
  
        const result = await response.json();
        if (response.ok) {
          alert("Reserva creada con éxito");
        } else {
          alert(result.message || "Error al crear la reserva");
        }
      } catch (error) {
        console.error("Error al crear reserva:", error);
        alert("Error en la conexión con el servidor");
      }
    } else {
      console.error("No token found!");
      alert("No se encontró el token de autenticación.");
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Primero, crear o buscar el cliente
    const clientId = await createClient();
  
    if (clientId) {
      // Si se obtiene una ID válida, crear la reserva
      createReservation(clientId);
    } else {
      alert("No se pudo crear ni encontrar al cliente.");
    }
  };
  


  return (
    <div className="añadir-reserva-content">
  <h1 className="añadir-reserva-title">Agregar Reserva</h1>
  <form ref={formRef} onSubmit={handleSubmit} className="añadir-reserva-form">
      {/* Tipo de Documento */}
      <label htmlFor="documentType" className="añadir-reserva-label">Tipo de Documento:</label>
      <select
        id="documentType"
        name="documentType"
        className="añadir-reserva-select"
        value={clientDocumentType}
        onChange={(e) => setClientDocumentType(e.target.value)}
        required
      >
        <option value="RUT">RUT</option>
        <option value="Pasaporte">Pasaporte</option>
        <option value="ID Extranjero">ID Extranjero</option>
      </select>

      {/* Número de Documento */}
      <label htmlFor="documento_cliente" className="añadir-reserva-label">Número de Documento:</label>
      <input
        type="text"
        id="documento_cliente"
        name="documento_cliente"
        className="añadir-reserva-input"
        value={clientDocumentNumber}
        onChange={handleClientDocumentNumber}
        required
      />
      {rutError && <p className="añadir-reserva-error-text">{rutError}</p>}

      {/* Nombre del Cliente */}
      <label htmlFor="nombre_cliente" className="añadir-reserva-label">Nombre del Cliente:</label>
      <input
        type="text"
        id="nombre_cliente"
        name="nombre_cliente"
        className="añadir-reserva-input"
        value={nombreCliente}
        onChange={(e) => setNombreCliente(e.target.value)}
        required
      />

      {/* Nacionalidad */}
      <label htmlFor="nacionalidad_cliente" className="añadir-reserva-label">Nacionalidad:</label>
      <input
        type="text"
        id="nacionalidad_cliente"
        name="nacionalidad_cliente"
        className="añadir-reserva-input"
        value={nacionalidadCliente}
        onChange={handleNacionalidadChange}
        required
      />

      {/* Teléfono */}
      <label htmlFor="telefono_cliente" className="añadir-reserva-label">Teléfono:</label>
      <input
        type="text"
        id="telefono_cliente"
        name="telefono_cliente"
        className="añadir-reserva-input"
        value={telefonoCliente}
        onChange={(e) => setTelefonoCliente(e.target.value)}
      />

      {/* Correo Electrónico */}
      <label htmlFor="email_cliente" className="añadir-reserva-label">Correo Electrónico:</label>
      <input
        type="email"
        id="email_cliente"
        name="email_cliente"
        className="añadir-reserva-input"
        value={emailCliente}
        onChange={(e) => setEmailCliente(e.target.value)}
      />

      {/* Selección de Cabaña */}
      <label htmlFor="habitacion" className="añadir-reserva-label">Seleccionar Cabaña:</label>
      <select
  id="habitacion"
  name="habitacion"
  className="añadir-reserva-select"
  value={habitacionSeleccionada}
  onChange={(e) => setHabitacionSeleccionada(e.target.value)}
  required
>
  <option value="">Seleccione una cabaña</option>
  {habitaciones
    .slice() // Clonamos el array para no modificar el original
    .sort((a, b) => {
      const tipoA = a.number.replace(/[0-9]/g, ""); // Extraer el texto (ej. "suite", "tinycabin")
      const tipoB = b.number.replace(/[0-9]/g, "");

      const numA = parseInt(a.number.match(/\d+/)?.[0]) || 0; // Extraer el número
      const numB = parseInt(b.number.match(/\d+/)?.[0]) || 0;

      if (tipoA === tipoB) {
        return numA - numB; // Si son del mismo tipo, ordenar por número
      }
      return tipoA.localeCompare(tipoB); // Ordenar alfabéticamente por tipo
    })
    .map((cabaña) => (
      <option key={cabaña._id} value={cabaña._id}>
        {cabaña.number}
      </option>
    ))}
</select>


      {/* Fechas */}
      <label htmlFor="fecha_entrada" className="añadir-reserva-label">Fecha de Entrada:</label>
      <input
        type="date"
        id="fecha_entrada"
        name="fecha_entrada"
        className="añadir-reserva-input"
        value={fechaEntrada}
        onChange={(e) => setFechaEntrada(e.target.value)}
        required
      />

      <label htmlFor="fecha_salida" className="añadir-reserva-label">Fecha de Salida:</label>
      <input
        type="date"
        id="fecha_salida"
        name="fecha_salida"
        className="añadir-reserva-input"
        value={fechaSalida}
        onChange={(e) => setFechaSalida(e.target.value)}
        required
      />
      {/* Canal de origen */}
      <label htmlFor="canal_origen" className="añadir-reserva-label">Canal de Origen:</label>
        <select
          id="canal_origen"
          name="canal_origen"
          className="añadir-reserva-select"
          value={canalOrigen}
          onChange={(e) => setCanalOrigen(e.target.value)}
          required
        >
          <option value="Directo">Directo</option>
          <option value="Booking">Booking</option>
        </select>

        {/* Estado de reserva */}

        <label htmlFor="estado" className="añadir-reserva-label">
          Estado:
        </label>
        <select
          id="estado"
          name="estado"
          className="añadir-reserva-select"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
        >
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        {/* Tipo de pago */}

        <label htmlFor="tipo_pago" className="añadir-reserva-label">
          Tipo de Pago:
        </label>
        <select
          id="tipo_pago"
          name="tipo_pago"
          className="añadir-reserva-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="Crédito">Crédito</option>
          <option value="Débito">Débito</option>
        </select>

        {/* Origen de pago */}

        <label htmlFor="origen_pago" className="añadir-reserva-label">
          Origen de Pago:
        </label>
        <select
          id="origen_pago"
          name="origen_pago"
          className="añadir-reserva-select"
          value={paymentOrigin}
          onChange={(e) => setPaymentOrigin(e.target.value)}
          required
        >
          <option value="Nacional">Nacional</option>
          <option value="Extranjero">Extranjero</option>
        </select>

        {/* Cantidad adultos y niños */}

        <label htmlFor="adultos" className="añadir-reserva-label">
          Adultos:
        </label>
        <input
          type="number"
          id="adultos"
          name="adultos"
          className="añadir-reserva-input"
          value={adultos}
          onChange={(e) => setAdultos(e.target.value)}
          required
        />

        <label htmlFor="ninos" className="añadir-reserva-label">
          Niños:
        </label>
        <input
          type="number"
          id="ninos"
          name="ninos"
          className="añadir-reserva-input"
          value={ninos}
          onChange={(e) => setNinos(e.target.value)}
          required
        />

      {/* Botones */}
      <div className="añadir-reserva-buttons">
        <button type="submit" className="añadir-reserva-submit">Aceptar</button>
        <button className="añadir-reserva-reset" onClick={handleReset}>Restablecer</button>
      </div>
  </form>
</div>

  );
}

export default AñadirReservas;
