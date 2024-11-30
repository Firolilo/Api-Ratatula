const mongoose = require("mongoose");

const CarritoProductoSchema = new mongoose.Schema({
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

const CarritoPromocionSchema = new mongoose.Schema({
    idPromo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promocion",
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
});

const CarritoComprasSchema = new mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    productos: {
        type: [CarritoProductoSchema],
        default: []
    },
    promociones: {
        type: [CarritoPromocionSchema],
        default: []
    },
    total: {
        type: Number,
        default: 0
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
    idLocal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: false
    },
});

module.exports = mongoose.model("CarritoCompras", CarritoComprasSchema);
