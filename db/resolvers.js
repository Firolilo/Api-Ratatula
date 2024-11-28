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
const {throwIfDisallowedDynamic} = require("next/dist/server/app-render/dynamic-rendering");
require('dotenv').config({path:'variables.env'});

const crearToken =  (usuario,  palabrasecreta,  expiresIn) => {
    const {id, correo, rol} = usuario;
    const waza = jwt.sign ({id, correo, rol}, palabrasecreta, {expiresIn})
    return waza;
}

const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            return jwt.verify(token, process.env.FIRMA_SECRETA);
        },
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

            const {email, password} = input;

            const existeUsuario = await Usuario.findOne({correo});
            if (existeUsuario){
                throw new Error('Usuario ya existe')
            }

            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(password, salt);

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

        autenticarUsuario: async (_, { input }) => {
            const {correo, password} = input;
            const existeUsuario = await Usuario.findOne({correo});
            if (!existeUsuario){
                throw new Error('Usuario no existe')
            }
            const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password);
            if (!passwordCorrecto)
            {
                throw new Error('Password Incorrecto')
            }

            return{
                token:crearToken(existeUsuario, process.env.FIRMA_SECRETA, '360000000000000000000000000000000000000000000000000000000000'),
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

        nuevoProducto: async (_, { input }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx
                if (ctx.usuario.rol === "local") {
                    const producto = new Producto(input);
                    return await producto.save();
                } else {
                    throw new Error("Prohibido, solo para Locales");
                }
            } catch (error) {
                throw new Error('Error al crear un nuevo producto.');
            }
        },

        actualizarProducto: async (_, { id, input }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx antes de permitir la actualización
                if (ctx.usuario.rol !== "local") {
                    throw new Error("Prohibido, solo para Locales");
                }

                const producto = await Producto.findByIdAndUpdate(id, input, { new: true });
                if (!producto) {
                    throw new Error(`Producto con ID ${id} no encontrado.`);
                }
                return producto;
            } catch (error) {
                throw new Error(error.message || 'Error al actualizar el producto.');
            }
        },

        eliminarProducto: async (_, { id }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx antes de permitir la eliminación
                if (ctx.usuario.rol !== "local") {
                    throw new Error("Prohibido, solo para Locales");
                }

                const producto = await Producto.findById(id);
                if (!producto) {
                    throw new Error(`Producto con ID ${id} no encontrado.`);
                }
                await Producto.findByIdAndDelete(id);
                return 'Producto eliminado!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar el producto.');
            }
        },


        nuevaPromocion: async (_, { input }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx
                if (ctx.usuario.rol === "local") {
                    const productosIds = input.productos.map((producto) => producto.idProducto);
                    const productosDuplicados = productosIds.filter((id, index) => productosIds.indexOf(id) !== index);

                    if (productosDuplicados.length > 0) {
                        throw new Error("No se pueden agregar productos duplicados a la promoción.");
                    }

                    const promocion = new Promocion(input);
                    return await promocion.save();
                } else {
                    throw new Error("Prohibido, solo para Locales");
                }
            } catch (error) {
                throw new Error('Error al crear una nueva promoción.');
            }
        },

        eliminarPromocion: async (_, { id }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx antes de permitir la eliminación
                if (ctx.usuario.rol !== "local") {
                    throw new Error("Prohibido, solo para Locales");
                }

                const promocion = await Promocion.findById(id);
                if (!promocion) {
                    throw new Error(`Promoción con ID ${id} no encontrada.`);
                }
                await Promocion.findByIdAndDelete(id);
                return 'Promoción eliminada!';
            } catch (error) {
                throw new Error(error.message || 'Error al eliminar la promoción.');
            }
        },


        nuevoPedido: async (_, { input }, ctx) => {
            try {
                if(ctx.usuario.rol === "local")
                {
                    for (const productoPedido of input.productos) {
                        const producto = await Producto.findById(productoPedido.idProducto);
                        if (!producto) {
                            throw new Error(`Producto con ID ${productoPedido.idProducto} no encontrado.`);
                        }

                        if (productoPedido.cantidad > producto.stock) {
                            throw new Error(
                                `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}, Requerido: ${productoPedido.cantidad}.`
                            );
                        }
                    }

                    const pedido = new Pedido(input);
                    const nuevoPedido = await pedido.save();

                    for (const productoPedido of input.productos) {
                        await Producto.findByIdAndUpdate(productoPedido.idProducto, {
                            $inc: { stock: -productoPedido.cantidad },
                        });
                    }
                    return nuevoPedido;
                }
                else {
                    throw new Error("Prohibit, solo para Locales")
                }

            } catch (error) {
                console.error("Error al crear pedido:", error.message);
                throw new Error(error.message || "Error al crear un nuevo pedido.");
            }
        },
        actualizarEstadoPedido: async (_, { id, estado },ctx) => {
            try {
                if(ctx.usuario.rol === "local")
                {
                    const pedido = await Pedido.findById(id);
                    if (!pedido)
                    {
                        throw new Error(`Pedido con ID ${id} no encontrado.`);
                    }
                    pedido.estado = estado;
                    return await pedido.save();
                }
                else {
                    throw new Error("Prohibit, solo para Locales")
                }
            } catch (error) {
                throw new Error(error.message || 'Error al actualizar el estado del pedido.');
            }
        },
        actualizarEstadoVentaPedido: async (_, { id, estadoVenta }) => {
            try {
                const pedido = await Pedido.findById(id);
                if (!pedido) {
                    throw new Error(`Pedido con ID ${id} no encontrado.`);
                }

                if (estadoVenta === "fallido" && pedido.estadoVenta !== "fallido") {

                    for (const productoPedido of pedido.productos) {
                        const producto = await Producto.findById(productoPedido.idProducto);
                        if (!producto) {
                            throw new Error(`Producto con ID ${productoPedido.idProducto} no encontrado.`);
                        }
                        await Producto.findByIdAndUpdate(
                            productoPedido.idProducto,
                            { $inc: { stock: productoPedido.cantidad } },
                            { new: true }
                        );
                    }
                }

                pedido.estadoVenta = estadoVenta;
                return await pedido.save();
            } catch (error) {
                console.error("Error al actualizar estadoVenta del pedido:", error.message);
                throw new Error(error.message || "Error al actualizar estadoVenta del pedido.");
            }
        },
        eliminarPedido: async (_, { id }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx antes de permitir la eliminación
                if (ctx.usuario.rol !== "local") {
                    throw new Error("Prohibido, solo para Locales");
                }

                const pedido = await Pedido.findById(id);
                if (!pedido) {
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

        nuevoReporte: async (_, { input }, ctx) => {
            try {
                // Comprobamos si el rol es 'local' usando el ctx antes de permitir la creación del reporte
                if (ctx.usuario.rol !== "local") {
                    throw new Error("Prohibido, solo para Locales");
                }

                const reporte = new Reporte(input);
                return await reporte.save();
            } catch (error) {
                console.error("Error al crear reporte:", error.message);
                throw new Error("Error al crear un nuevo reporte.");
            }
        },

        agregarProductoACarrito: async (_, { idUsuario, producto }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });

                if (!carrito) {
                    throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                }

                const { idProducto, cantidad } = producto;

                const productoDB = await Producto.findById(idProducto);
                if (!productoDB) {
                    throw new Error(`Producto con ID ${idProducto} no encontrado`);
                }

                const productoExistente = carrito.productos.find(p => p.idProducto.toString() === idProducto);
                const cantidadActual = productoExistente ? productoExistente.cantidad : 0;

                if (cantidadActual + cantidad > productoDB.stock) {
                    throw new Error(
                        `No se puede añadir el producto al carrito. Stock insuficiente. Stock disponible: ${productoDB.stock}, solicitado: ${cantidadActual + cantidad}`
                    );
                }

                if (productoExistente) {
                    productoExistente.cantidad += cantidad;
                } else {
                    carrito.productos.push({ idProducto, cantidad });
                }

                carrito.total += productoDB.precio * cantidad;
                carrito.fechaActualizacion = new Date();

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al agregar producto al carrito: ${error.message}`);
            }
        },

        agregarPromoACarrito: async (_, { idUsuario, producto }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });

                if (!carrito) {
                    throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                }

                const { idPromo, cantidad } = producto;

                const promoDB = await Promocion.findById(idPromo);
                if (!promoDB) {
                    throw new Error(`Promoción con ID ${idPromo} no encontrada`);
                }

                const promoExistente = carrito.promociones.find(p => p.idPromo.toString() === idPromo);
                const cantidadActual = promoExistente ? promoExistente.cantidad : 0;

                for (const productoPromo of promoDB.productos) {
                    const productoDB = await Producto.findById(productoPromo.idProducto);
                    const cantidadTotal = (cantidadActual + cantidad) * productoPromo.cantidad;

                    if (productoDB.stock < cantidadTotal) {
                        throw new Error(
                            `No se puede añadir la promoción al carrito. Stock insuficiente para el producto ${productoDB.nombre}. ` +
                            `Stock disponible: ${productoDB.stock}, solicitado: ${cantidadTotal}`
                        );
                    }
                }

                if (promoExistente) {
                    promoExistente.cantidad += cantidad;
                } else {
                    carrito.promociones.push({ idPromo, cantidad });
                }

                carrito.total += promoDB.precioPromo * cantidad;
                carrito.fechaActualizacion = new Date();

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al agregar promoción al carrito: ${error.message}`);
            }
        },
        eliminarProductoDeCarrito: async (_, { idUsuario, idProducto }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });

                if (!carrito) {
                    throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                }

                const producto = carrito.productos.find(p => p.idProducto.toString() === idProducto);
                if (!producto) {
                    throw new Error(`Producto con ID ${idProducto} no encontrado en el carrito`);
                }

                const productoDB = await Producto.findById(idProducto);
                if (productoDB) {
                    carrito.total -= productoDB.precio * producto.cantidad;
                }

                carrito.productos = carrito.productos.filter(p => p.idProducto.toString() !== idProducto);
                carrito.fechaActualizacion = new Date();

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
            }
        },
        eliminarPromoDeCarrito: async (_, { idUsuario, idPromo }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });

                if (!carrito) {
                    throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                }

                const promo = carrito.promociones.find(p => p.idPromo.toString() === idPromo);
                if (!promo) {
                    throw new Error(`Promoción con ID ${idPromo} no encontrada en el carrito`);
                }

                const promoDB = await Promocion.findById(idPromo);
                if (promoDB) {
                    carrito.total -= promoDB.precioPromo * promo.cantidad;
                }

                carrito.promociones = carrito.promociones.filter(p => p.idPromo.toString() !== idPromo);
                carrito.fechaActualizacion = new Date();

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al eliminar promoción del carrito: ${error.message}`);
            }
        },
        vaciarCarrito: async (_, { idUsuario }) => {
            try {
                const carrito = await Carrito.findOne({ idUsuario });

                if (!carrito) {
                    throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                }

                carrito.productos = [];
                carrito.promociones = [];
                carrito.total = 0;
                carrito.fechaActualizacion = new Date();

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al vaciar el carrito: ${error.message}`);
            }
        }
    },
};

module.exports = resolvers;