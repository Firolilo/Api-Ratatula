const Pedido = require('../models/Pedido');

const verificarPedidosPendientes = async () => {
    try {
        const haceCincoMinutos = new Date(Date.now() - 5 * 60 * 1000);

        const pedidosPendientes = await Pedido.find({
            estadoVenta: "pendiente",
            fechaCreacion: { $lt: haceCincoMinutos },
        });

        if (pedidosPendientes.length > 0) {
            console.log(`Se encontraron ${pedidosPendientes.length} pedidos pendientes expirados. Actualizando...`);

            // Actualizar todos los pedidos encontrados a estadoVenta "fallido"
            await Pedido.updateMany(
                { _id: { $in: pedidosPendientes.map((pedido) => pedido._id) } },
                { $set: { estadoVenta: "fallido" } }
            );

            console.log(`Se actualizaron ${pedidosPendientes.length} pedidos a estado "fallido".`);
        } else {
            console.log("No se encontraron pedidos pendientes expirados.");
        }
    } catch (error) {
        console.error("Error al verificar pedidos pendientes:", error.message);
    }
};

module.exports = verificarPedidosPendientes;
