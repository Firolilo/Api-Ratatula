const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    precio: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    imagen: {
        type: String
    },
    idLocal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
});

module.exports = mongoose.model("Producto", ProductoSchema);
