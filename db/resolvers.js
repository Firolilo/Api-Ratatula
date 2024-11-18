const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Promocion = require('../models/promocion');
const Carrito = require('../models/carritoCompras');
const Pedido = require('../models/pedido');
const NotaDeVenta = require('../models/notaVenta');
const Reporte = require('../models/reporte');
const Solicitud = require('../models/solicitud');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'variables.env'});


const resolvers = {
    Query: {
        obtenerUsuarios: async () => {
            try {
                return await Usuario.find({});
            } catch (error) {
                throw new Error('Error al obtener los usuarios.');
            }
        },
        obtenerUsuarioPorID: async (_, { id }) => {
            try {
                const usuario = await Usuario.findById(id);
                if (!usuario)
                {
                    throw new Error(`Usuario con ID ${id} no encontrado.`);
                }
                return usuario;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener el usuario.');
            }
        },

        obtenerSolicitudes: async () => {
            try {
                return await Solicitud.find({});
            } catch (error) {
                throw new Error('Error al obtener las solicitudes.');
            }
        },
        obtenerSolicitudPorID: async (_, { id }) => {
            try {
                const solicitud = await Solicitud.findById(id);
                if (!solicitud)
                {
                    throw new Error(`Solicitud con ID ${id} no encontrado.`);
                }
                return solicitud;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener la solicitud.');
            }
        },

        obtenerProductos: async () => {
            try {
                return await Producto.find({});
            } catch (error) {
                throw new Error('Error al obtener los productos.');
            }
        },
        obtenerProductoPorID: async (_, { id }) => {
            try {
                const producto = await Producto.findById(id);
                if (!producto)
                {
                    throw new Error(`Producto con ID ${id} no encontrado.`);
                }
                return producto;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener el producto.');
            }
        },

        obtenerPromociones: async () => {
            try {
                return await Promocion.find({});
            } catch (error) {
                throw new Error('Error al obtener las promociones.');
            }
        },
        obtenerPromocionPorID: async (_, { id }) => {
            try {
                const promocion = await Promocion.findById(id);
                if (!promocion)
                {
                    throw new Error(`Promoción con ID ${id} no encontrada.`);
                }
                return promocion;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener la promoción.');
            }
        },

        obtenerCarrito: async (_, { idUsuario }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });
                if (!carrito)
                {
                    throw new Error(`Carrito del usuario con ID ${idUsuario} no encontrado.`);
                }
                return carrito;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener el carrito.');
            }
        },

        obtenerPedidos: async () => {
            try {
                return await Pedido.find({});
            } catch (error) {
                throw new Error('Error al obtener los pedidos.');
            }
        },
        obtenerPedidoPorID: async (_, { id }) => {
            try {
                const pedido = await Pedido.findById(id);
                if (!pedido)
                {
                    throw new Error(`Pedido con ID ${id} no encontrado.`);
                }
                return pedido;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener el pedido.');
            }
        },

        obtenerNotasDeVenta: async () => {
            try {
                return await NotaDeVenta.find({});
            } catch (error) {
                throw new Error('Error al obtener las notas de venta.');
            }
        },
        obtenerNotaDeVentaPorID: async (_, { id }) => {
            try {
                const nota = await NotaDeVenta.findById(id);
                if (!nota)
                {
                    throw new Error(`Nota de venta con ID ${id} no encontrada.`);
                }
                return nota;
            } catch (error) {
                throw new Error(error.message || 'Error al obtener la nota de venta.');
            }
        },

        obtenerReportes: async (_, { idLocal }) => {
            try {
                return await Reporte.find({ idLocal });
            } catch (error) {
                throw new Error('Error al obtener los reportes.');
            }
        },
    },
    Mutation: {
        nuevoUsuario: async (_, { input }) => {
            try {
                const usuario = new Usuario(input);
                const nuevoUsuario = await usuario.save();

                if (input.rol !== "local") {
                    const carrito = new Carrito({
                        idUsuario: nuevoUsuario._id,
                        productos: [],
                        promociones: [],
                        total: 0,
                        fechaActualizacion: new Date(),
                    });

                    const nuevoCarrito = await carrito.save();

                    nuevoUsuario.idCarrito = nuevoCarrito._id;
                }
                await nuevoUsuario.save();

                return nuevoUsuario;
            } catch (error) {
                console.error('Error al crear usuario y carrito:', {
                    message: error.message,
                    stack: error.stack,
                });

                throw new Error(`Error al crear el usuario y su carrito: ${error.message}`);
            }
        },
        actualizarUsuario: async (_, { id, input }) => {
            try {
                const usuario = await Usuario.findByIdAndUpdate(id, input, { new: true });
                if (!usuario)
                {
                    throw new Error(`Usuario con ID ${id} no encontrado.`);
                }
                return usuario;
            } catch (error) {
                throw new Error(error.message || 'Error al actualizar el usuario.');
            }
        },
        eliminarUsuario: async (_, { id }) => {
            try {
                const usuario = await Usuario.findById(id);
                if (!usuario)
                {
                    throw new Error(`Usuario con ID ${id} no encontrado.`);
                }
                await Usuario.findByIdAndDelete(id);
                return 'Usuario eliminado!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar el usuario.');
            }
        },

        nuevaSolicitud: async (_, { input }) => {
            try {
                const solicitud = new Solicitud(input);
                return await solicitud.save();
            } catch (error) {
                console.error('Error al crear una solicitud:', error.message);
                throw new Error(`Error al crear una nueva solicitud: ${error.message}`);
            }
        },

        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);
                return await producto.save();
            } catch (error) {
                throw new Error('Error al crear un nuevo producto.');
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            try {
                const producto = await Producto.findByIdAndUpdate(id, input, { new: true });
                if (!producto)
                {
                    throw new Error(`Producto con ID ${id} no encontrado.`);
                }
                return producto;
            } catch (error) {
                throw new Error(error.message || 'Error al actualizar el producto.');
            }
        },
        eliminarProducto: async (_, { id }) => {
            try {
                const producto = await Producto.findById(id);
                if (!producto)
                {
                    throw new Error(`Producto con ID ${id} no encontrado.`);
                }
                await Producto.findByIdAndDelete(id);
                return 'Producto eliminado!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar el producto.');
            }
        },

        nuevaPromocion: async (_, { input }) => {
            try {
                const promocion = new Promocion(input);
                return await promocion.save();
            } catch (error) {
                throw new Error('Error al crear una nueva promoción.');
            }
        },
        eliminarPromocion: async (_, { id }) => {
            try {
                const promocion = await Promocion.findById(id);
                if (!promocion)
                {
                    throw new Error(`Promoción con ID ${id} no encontrada.`);
                }
                await Promocion.findByIdAndDelete(id);
                return 'Promoción eliminada!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar la promoción.');
            }
        },

        nuevoPedido: async (_, { input }) => {
            try {
                const pedido = new Pedido(input);
                return await pedido.save();
            } catch (error) {
                console.error("Error al crear pedido:", error.message);
                throw new Error("Error al crear un nuevo pedido.");
            }
        },
        actualizarEstadoPedido: async (_, { id, estado }) => {
            try {
                const pedido = await Pedido.findById(id);
                if (!pedido)
                {
                    throw new Error(`Pedido con ID ${id} no encontrado.`);
                }
                pedido.estado = estado;
                return await pedido.save();
            } catch (error) {
                throw new Error(error.message || 'Error al actualizar el estado del pedido.');
            }
        },
        eliminarPedido: async (_, { id }) => {
            try {
                const pedido = await Pedido.findById(id);
                if (!pedido)
                {
                    throw new Error(`Pedido con ID ${id} no encontrado.`);
                }
                await Pedido.findByIdAndDelete(id);
                return 'Pedido eliminado!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar el pedido.');
            }
        },

        nuevaNotaDeVenta: async (_, { input }) => {
            try {
                const nota = new NotaDeVenta(input);

                const pedido = await Pedido.findById(input.idPedido);
                if (!pedido) {
                    throw new Error(`Pedido con ID ${input.idPedido} no encontrado.`);
                }

                if (!nota.montoTotal) {
                    nota.montoTotal = pedido.total;
                }

                if (input.montoPagado) {
                    nota.cambio = input.montoPagado - nota.montoTotal;
                }

                const nuevaNota = await nota.save();

                pedido.estadoVenta = "completado";
                await pedido.save();

                return nuevaNota;
            } catch (error) {
                console.error("Error al crear nota de venta y actualizar estado del pedido:", error.message);
                throw new Error(`Error al registrar una nueva nota de venta: ${error.message}`);
            }
        },

        nuevoReporte: async (_, { input }) => {
            try {
                const reporte = new Reporte(input);
                return await reporte.save();
            } catch (error) {
                console.error("Error al crear reporte:", error.message);
                throw new Error("Error al crear un nuevo reporte.");
            }
        }
    },
};

module.exports = resolvers;