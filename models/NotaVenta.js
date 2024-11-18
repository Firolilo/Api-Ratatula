const mongoose = require("mongoose");

const NotaDeVentaSchema = new mongoose.Schema({
    idPedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pedido",
        required: true
    },
    metodo: {
        type: String,
        enum: ["QR", "efectivo"],
        required: true
    },
    montoTotal: {
        type: Number,
        default: 0
    },
    montoPagado: {
        type: Number,
        default: 0
    },
    cambio: {
        type: Number,
        default: 0
    },
    fechaPago: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("NotaDeVenta", NotaDeVentaSchema);
