const mongoose = require("mongoose");

const PedidoProductoSchema = new mongoose.Schema({
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

const PedidoPromocionSchema = new mongoose.Schema({
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

const PedidoSchema = new mongoose.Schema({
    idCliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    idLocal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    productos: {
        type: [PedidoProductoSchema],
        default: []
    },
    promociones: {
        type: [PedidoPromocionSchema],
        default: []
    },
    tiempoPreparacion: {
        type: Number,
        default: 0
    },
    estado: {
        type: String,
        enum: ["pendiente", "en preparación", "listo", "entregado"],
        default: "pendiente"
    },
    estadoVenta: {
        type: String,
        enum: ["pendiente", "completado", "fallido"],
        default: "pendiente"
    },
    total: {
        type: Number
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    urlqr: {
        type: String
    }
});

PedidoSchema.pre("save", async function (next) {
    try {
        let total = 0;

        if (this.productos.length > 0) {
            for (const item of this.productos) {
                const producto = await mongoose.model("Producto").findById(item.idProducto);
                if (producto) {
                    total += producto.precio * item.cantidad;
                }
            }
        }

        if (this.promociones.length > 0) {
            for (const promo of this.promociones) {
                const promocion = await mongoose.model("Promocion").findById(promo.idPromo);
                if (promocion) {
                    total += promocion.precioPromo * promo.cantidad;
                }
            }
        }

        this.total = total;

        next();
    } catch (error) {
        console.error("Error al calcular el total del pedido:", error.message);
        next(error);
    }
});

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);
