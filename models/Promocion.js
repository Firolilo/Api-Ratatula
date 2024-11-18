const mongoose = require("mongoose");

const PromocionProductoSchema = new mongoose.Schema({
    idProducto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },
    cantidad: {
        type: Number, 
        required: true
    },
});

const PromocionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    precioReal: {
        type: Number,
        required: true
    },
    precioPromo: {
        type: Number,
        required: true
    },
    productos: {
        type: [PromocionProductoSchema],
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

module.exports = mongoose.model("Promocion", PromocionSchema);
