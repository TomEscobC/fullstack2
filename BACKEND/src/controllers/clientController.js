const Client = require("../models/clientModels");

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Client.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener clientes", error });
    }
};

// Buscar cliente por número de documento
const obtenerClientePorDocumento = async (req, res) => {
  try {
    const { documentNumber } = req.query; // Obtener el número de documento desde la consulta
    if (!documentNumber) {
      return res.status(400).json({ message: "El número de documento es obligatorio" });
    }

    // Usamos findOne() para obtener un único cliente
    const cliente = await Client.findOne({ documentNumber }); // Buscar por documentNumber
    if (cliente) {
      return res.json(cliente);  // Si el cliente existe, retornamos los datos del cliente
    } else {
      return res.json(null);  // Si no existe, retornamos null
    }
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    return res.status(500).json({ message: "Error al buscar cliente", error });
  }
};

  

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
    try {
        console.log("🔍 BODY RECIBIDO:", req.body);

        const { documentType, documentNumber, name, nationality, phone, email } = req.body;

        // Verificar que todos los campos requeridos están presentes
        if (!documentType || !documentNumber || !name || !nationality) {
            return res.status(400).json({ mensaje: "Todos los campos (documentType, documentNumber, name, nationality) son requeridos" });
        }

        // Verificar si el cliente ya existe
        const clienteExistente = await Client.findOne({ documentNumber });
        if (clienteExistente) {
            return res.status(400).json({ mensaje: "El cliente ya existe" });
        }

        // Crear el nuevo cliente
        const nuevoCliente = new Client({ documentType, documentNumber, name, nationality, phone, email });
        await nuevoCliente.save();

        console.log("✅ Cliente creado con éxito:", nuevoCliente);
        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error("❌ Error al crear cliente:", error);
        res.status(500).json({ mensaje: "Error al crear cliente", error });
    }
};

// Actualizar un cliente por ID
const actualizarCliente = async (req, res) => {
    try {
        const clienteActualizado = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!clienteActualizado) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json(clienteActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar cliente", error });
    }
};

// Eliminar un cliente por ID
const eliminarCliente = async (req, res) => {
    try {
        const clienteEliminado = await Client.findByIdAndDelete(req.params.id);
        if (!clienteEliminado) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar cliente", error });
    }
};

// Exportar todas las funciones al final
module.exports = {
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerClientePorDocumento
};
