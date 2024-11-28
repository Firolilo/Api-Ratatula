const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/*const generarToken = (usuarioId, email) => {
    return jwt.sign({ id: usuarioId, email: email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};*/

const verificarToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null; // Si el token es inválido o ha expirado, retorna null
    }
};

module.exports = { verificarToken };
