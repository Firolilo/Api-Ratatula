const mongoose = require("mongoose");

const HorariosSchema = new mongoose.Schema({
    apertura: {
        type: String,
        required: true
    },
    cierre: {
        type: String,
        required: true
    },
});

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        required: true,
        enum: ["cliente", "local"]
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ["activo", "inactivo"],
        default: "activo"
    },
    telefono: {
        type: String,
        required: true
    },
    idCarrito: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CarritoCompras"
    },
    descripcion: {
        type: String
    },
    categoria: {
        type: [String],
        required: function () {
            return this.rol === "local";
        }
    },
    horarios: {
        type: HorariosSchema,
        required: function ()
        {
            return this.rol === 'local';
        }
    },
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
