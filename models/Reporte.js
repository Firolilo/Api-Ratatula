const mongoose = require("mongoose");

const ReporteSchema = new mongoose.Schema({
    idLocal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    ventasTotales: {
        type: Number,
        default: 0
    },
    pedidosCompletados: {
        type: Number,
        default: 0
    },
    pedidosVendidos: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Pedido",
        default: []
    },
});

// Middleware para calcular ventasTotales, pedidosCompletados y pedidosVendidos
ReporteSchema.pre("save", async function (next) {
    try {
        const Pedido = mongoose.model("Pedido");

        // Obtener pedidos entre las fechas especificadas y del local indicado
        const pedidos = await Pedido.find({
            idLocal: this.idLocal,
            fechaCreacion: { $gte: this.fechaInicio, $lte: this.fechaFin },
            estado: "entregado",
        });

        // Calcular ventasTotales
        this.ventasTotales = pedidos.reduce((total, pedido) => total + pedido.total, 0);

        // Contar pedidos completados
        this.pedidosCompletados = pedidos.length;

        // Guardar los IDs de los pedidos completados
        this.pedidosVendidos = pedidos.map((pedido) => pedido._id);

        next();
    } catch (error) {
        console.error("Error al calcular los campos del reporte:", error.message);
        next(error);
    }
});

module.exports = mongoose.model("Reporte", ReporteSchema);
