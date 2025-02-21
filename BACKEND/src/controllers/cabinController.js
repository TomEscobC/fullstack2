const Cabin = require("../models/cabinModels");

// Obtener todas las Cabins
const obtenerCabanas = async (req, res) => {
    try {
        const cabanas = await Cabin.find();
        res.json(cabanas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener cabañas", error });
    }
};

// Crear una nueva Cabin
const crearCabana = async (req, res) => {
    try {
        console.log("🔍 BODY RECIBIDO:", req.body);

        const { type, number, maxAdults, maxChildren, price, currency } = req.body;

        // Verificar que todos los campos requeridos están presentes
        if (!type || !number || !maxAdults || !maxChildren || !price) {
            return res.status(400).json({ mensaje: "Todos los campos (type, number, maxAdults, maxChildren, price) son requeridos" });
        }

        // Verificar si la Cabin ya existe anteriormente
        const cabanaExistente = await Cabin.findOne({ number });
        if (cabanaExistente) {
            return res.status(400).json({ mensaje: "La cabaña con este número ya existe" });
        }

        // Crear la nueva Cabin
        const nuevaCabana = new Cabin({ type, number, maxAdults, maxChildren, price, currency });
        await nuevaCabana.save();

        console.log("✅ Cabaña creada con éxito:", nuevaCabana);
        res.status(201).json(nuevaCabana);
    } catch (error) {
        console.error("❌ Error al crear cabaña:", error);
        res.status(500).json({ mensaje: "Error al crear cabaña", error });
    }
};

// Actualizar una Cabin por ID
const actualizarCabana = async (req, res) => {
    try {
        const cabanaActualizada = await Cabin.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cabanaActualizada) {
            return res.status(404).json({ mensaje: "Cabaña no encontrada" });
        }
        res.json(cabanaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar cabaña", error });
    }
};

// Eliminar una Cabin por ID
const eliminarCabana = async (req, res) => {
    try {
        const cabanaEliminada = await Cabin.findByIdAndDelete(req.params.id);
        if (!cabanaEliminada) {
            return res.status(404).json({ mensaje: "Cabaña no encontrada" });
        }
        res.json({ mensaje: "Cabaña eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar cabaña", error });
    }
};

// Exportar todas las funciones de Cabins
module.exports = {
    obtenerCabanas,
    crearCabana,
    actualizarCabana,
    eliminarCabana
};
