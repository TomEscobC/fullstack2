const usersModels = require('../models/usersModels');
const bcrypt = require('bcrypt');

// Registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new usersModels({
            username: username,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const users = await usersModels.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un usuario por ID
const actualizarUsuario = async (req, res) => {
    try {
        const user = await usersModels.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        user.username = req.body.username || user.username;
        user.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un usuario por ID
const eliminarUsuario = async (req, res) => {
    try {
        const user = await usersModels.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registrarUsuario,
    obtenerUsuarios,
    actualizarUsuario,
    eliminarUsuario
};
