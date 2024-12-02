const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Promocion = require('../models/Promocion');
const Carrito = require('../models/CarritoCompras');
const Pedido = require('../models/Pedido');
const NotaDeVenta = require('../models/NotaVenta');
const Reporte = require('../models/Reporte');
const Solicitud = require('../models/Solicitud');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mime = require('mime-types');
const sharp = require('sharp');
const axios = require("axios");
const {c} = require("react/compiler-runtime");
require('dotenv').config({path:'variables.env'});

const crearToken =  (usuario,  palabrasecreta,  expiresIn) => {
    const {id, correo, rol} = usuario;
    const waza = jwt.sign ({id, correo, rol}, palabrasecreta, {expiresIn})
    return waza;
}

const convertirImagenABase64 = async (rutaImagen, opciones = { width: null, quality: 80 }) => {
    try {
        const mimeType = mime.lookup(rutaImagen);

        if (!mimeType) {
            throw new Error('No se pudo determinar el tipo de la imagen.');
        }

        const buffer = await sharp(rutaImagen)
            .resize(opciones.width ? { width: opciones.width, height: opciones.width} : null)
            .jpeg({ quality: opciones.quality })
            .toBuffer();

        const imagenBase64 = buffer.toString('base64');
        return `data:${mimeType};base64,${imagenBase64}`;
    } catch (error) {
        console.error("Error al convertir la imagen a Base64:", error.message);
        return null;
    }
};

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

        obtenerLocales: async (_, __, ctx) => {
            try {
                if (ctx) {
                    return await Usuario.find({rol: 'local'});
                } else {
                    new Error('Permiso denegado');
                }
            } catch (error) {
                console.error('Error original:', error);
                throw new Error(`Error al obtener los usuarios. Detalles: ${error.message}`);
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

        obtenerProductosLocal: async (_, { idLocal },ctx) => {
            try {
                if(ctx) {
                    return await Producto.find({idLocal: idLocal})
                }
            } catch (error) {
                throw new Error(error.message || 'Error al obtener los productos.');
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

        obtenerPromocionesLocal: async (_, { idLocal },ctx) => {
            try {
                if(ctx) {
                    return await Promocion.find({idLocal: idLocal})
                }
            } catch (error) {
                throw new Error(error.message || 'Error al obtener los productos.');
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

        obtenerPedidosClienteEntregado: async (_, { id }, ctx) => {
            try {
                if (ctx) {
                    console.log(id);
                    return await Pedido.find({
                        idCliente: id,
                        estado: 'entregado'}
                    );
                } else {
                    new Error('Permiso denegado');
                }
            } catch (error) {
                console.error('Error original:', error);
                throw new Error(`Error al obtener los pedidos. Detalles: ${error.message}`);
            }
        },
        obtenerPedidosClienteNEntregado: async (_, { id }, ctx) => {
            try {
                if (ctx) {
                    return await Pedido.find({
                        idCliente: id,
                        estado: { $in: ['preparacion', 'pendiente', 'listo'] },
                    });
                } else {
                    throw new Error('Permiso denegado');
                }
            } catch (error) {
                console.error('Error original:', error);
                throw new Error(`Error al obtener los pedidos. Detalles: ${error.message}`);
            }
        },

        obtenerPedidosLocalCompletado: async (_, { id }, ctx) => {
            try {
                if (ctx) {
                    return await Pedido.find({
                        idLocal: id,
                        estadoVenta: 'completado',
                    });
                } else {
                    throw new Error('Permiso denegado');
                }
            } catch (error) {
                console.error('Error original:', error);
                throw new Error(`Error al obtener los pedidos. Detalles: ${error.message}`);
            }
        },

        obtenerPedidosLocalPendiente: async (_, { id }, ctx) => {
            try {
                if (ctx) {
                    return await Pedido.find({
                        idLocal: id,
                        estadoVenta: 'pendiente',
                    });
                } else {
                    throw new Error('Permiso denegado');
                }
            } catch (error) {
                console.error('Error original:', error);
                throw new Error(`Error al obtener los pedidos. Detalles: ${error.message}`);
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

            const {correo, password} = input;

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
                        idLocal: null
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
                if (ctx.usuario.rol === "local") {
                    if(input.imagen)
                    {
                        const imagen64 = await convertirImagenABase64(input.imagen, { width: 500, quality: 75 });
                        if(!imagen64)
                        {
                            throw new Error("La imagen proporcionada no es válida.");
                        }
                        input.imagen = imagen64;
                    }

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
                if (ctx.usuario.rol === "local") {
                    const productosIds = input.productos.map((producto) => producto.idProducto);

                    const productosDuplicados = productosIds.filter((id, index) => productosIds.indexOf(id) !== index);

                    if (productosDuplicados.length > 0) {
                        throw new Error("No se pueden agregar productos duplicados a la promoción.");
                    }

                    const productosDB = await Producto.find({ '_id': { $in: productosIds } });

                    input.precioReal = productosDB.reduce((total, producto) => {
                        return total + producto.precio;
                    }, 0);

                    if(input.imagen)
                    {
                        const imagen64 = await convertirImagenABase64(input.imagen, { width: 500, quality: 75 });
                        if(!imagen64)
                        {
                            throw new Error("La imagen proporcionada no es válida.");
                        }
                        input.imagen = imagen64;
                    }


                    const promocion = new Promocion(input);
                    return await promocion.save();
                } else {
                    throw new Error("Prohibido, solo para Locales");
                }
            } catch (error) {
                throw new Error('Error al crear una nueva promoción: ' + error.message);
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
                if (ctx) {
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

                    if (input.qr) {
                        const productosDescripcion = input.productos.map((producto) => ({
                            concepto: "Pedido Ratatula",
                            cantidad: 1,
                            costo_unitario: nuevoPedido.total,
                        }));

                        const deudaRequest = {
                            appkey: "11bb10ce-68ba-4af1-8eb7-4e6624fed729",
                            email_cliente: ctx.usuario.correo,
                            identificador: nuevoPedido._id.toString(),
                            descripcion: `Pedido ${nuevoPedido._id}`,
                            nombre_cliente: ctx.usuario.nombre,
                            apellido_cliente: ctx.usuario.apellido,
                            fecha_vencimiento: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos de vencimiento
                            lineas_detalle_deuda: productosDescripcion,
                            callback_url: `http://34.16.100.239:4000/api/pago-exitoso`,
                        };

                        console.log(nuevoPedido._id.toString());

                        try {
                            const response = await axios.post(
                                "https://api.libelula.bo/rest/deuda/registrar",
                                deudaRequest,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            );

                            const { id_transaccion, qr_simple_url } = response.data;
                            console.log(response.data);

                            if (qr_simple_url) {
                                await Pedido.findByIdAndUpdate(nuevoPedido._id, {
                                    urlqr: qr_simple_url,
                                    transaccionID: id_transaccion,
                                });
                            } else {
                                throw new Error("No se generó el QR Simple URL.");
                            }
                        } catch (error) {
                            console.error("Error al registrar deuda en Libélula:", error.response?.data || error.message);
                            throw new Error("No se pudo registrar la deuda en la pasarela de pagos.");
                        }
                    }

                    for (const productoPedido of input.productos) {
                        await Producto.findByIdAndUpdate(productoPedido.idProducto, {
                            $inc: { stock: -productoPedido.cantidad },
                        });
                    }

                    return nuevoPedido;
                } else {
                    throw new Error("Prohibido, necesita autenticación");
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
        actualizarTiempoPedido: async (_, { id, tiempoPreparacion }, ctx) => {
            try {
                if(ctx.usuario.rol !== "local")
                {
                    throw new Error("Prohibido, solo para Locales")
                }
                const pedido = await Pedido.findById(id);
                if (!pedido)
                {
                    throw new Error(`Pedido con ID ${id} no encontrado.`);
                }
                pedido.tiempoPreparacion = tiempoPreparacion;
                return await pedido.save();
            } catch (error){
                console.error("Error al actualizar tiempo del pedido:", error.message);
                throw new Error(error.message || "Error al actualizar tiempo del pedido");
            }
        },
        eliminarPedido: async (_, { id }, ctx) => {
            try {
                if (!ctx) {
                    throw new Error("Prohibido, necesitas estar Logueado");
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

        nuevaNotaDeVentaQR: async (_, { transaction_id }) => {
            try {

                const pedido = await Pedido.findById(transaction_id);
                if (!pedido) {
                    throw new Error(`Pedido con transaccionID ${input.idPedido} no encontrado.`);
                }

                const nota = new NotaDeVenta(
                    {
                        idPedido: pedido._id.toString(),
                        metodo: "QR",
                        montoTotal: pedido.total,
                        montoPagado: pedido.total
                    }
                );

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

        agregarProductoACarrito: async (_, { idUsuario, producto }, ctx) => {
            try {
                if (ctx) {
                    const carrito = await Carrito.findOne({ idUsuario });

                    if (!carrito) {
                        throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                    }

                    const { idProducto, cantidad } = producto;

                    // Buscar el producto en la base de datos
                    const productoDB = await Producto.findById(idProducto);
                    if (!productoDB) {
                        throw new Error(`Producto con ID ${idProducto} no encontrado`);
                    }

                    if (carrito.promociones.length === 0 && carrito.productos.length === 0 && !carrito.idLocal) {
                        carrito.idLocal = productoDB.idLocal;
                    } else {
                        const waza = productoDB.idLocal.toString();
                        const wazaCarrito = carrito.idLocal.toString();
                        if (waza !== wazaCarrito) {
                            throw new Error(`No se puede añadir el producto al carrito. Solo prodctos de un Local`);
                        }
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

                } else {
                    // Si el usuario no está autenticado, lanzamos un error
                    throw new Error(`Prohibido: Necesitas loguearte`);
                }
            } catch (error) {
                // Manejo del error
                throw new Error(`Error al agregar producto al carrito: ${error.message}`);
            }
        },

        agregarPromoACarrito: async (_, { idUsuario, producto }, ctx) => {
            try {
                // Verificar que el usuario esté autenticado
                if (ctx) {
                    const carrito = await Carrito.findOne({ idUsuario });

                    if (!carrito) {
                        throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                    }

                    const { idPromo, cantidad } = producto;

                    // Buscar la promoción en la base de datos
                    const promoDB = await Promocion.findById(idPromo);
                    if (!promoDB) {
                        throw new Error(`Promoción con ID ${idPromo} no encontrada`);
                    }

                    if (carrito.promociones.length === 0 && carrito.productos.length === 0 && !carrito.idLocal) {
                        carrito.idLocal = promoDB.idLocal;
                    } else {
                        const waza = promoDB.idLocal.toString();
                        const wazaCarrito = carrito.idLocal.toString();
                        if (waza !== wazaCarrito) {
                            throw new Error(`No se puede añadir el producto al carrito. Solo productos de un Local`);
                        }
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
                } else {
                    throw new Error(`Prohibido: Necesitas loguearte`);
                }
            } catch (error) {
                throw new Error(`Error al agregar promoción al carrito: ${error.message}`);
            }
        },

        eliminarProductoDeCarrito: async (_, { idUsuario, idProducto }, ctx) => {
            try {
                if (ctx) {
                    const carrito = await Carrito.findOne({ idUsuario });

                    if (!carrito) {
                        throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                    }

                    // Buscar el producto en el carrito
                    const productoExistente = carrito.productos.find(p => p.idProducto.toString() === idProducto);

                    if (!productoExistente) {
                        throw new Error(`Producto con ID ${idProducto} no encontrado en el carrito`);
                    }

                    // Si hay más de 1 unidad del producto, decrementamos la cantidad
                    if (productoExistente.cantidad > 1) {
                        productoExistente.cantidad -= 1;
                    } else {
                        // Si solo hay una unidad, eliminamos el producto del carrito
                        carrito.productos = carrito.productos.filter(p => p.idProducto.toString() !== idProducto);
                    }

                    if (carrito.promociones.length === 0 && carrito.productos.length === 0 && carrito.idLocal) {
                        carrito.idLocal = null;
                    }

                    let totalCarrito = 0;

                    for (const producto of carrito.productos) {
                        const productoDB = await Producto.findById(producto.idProducto);
                        totalCarrito += productoDB.precio * producto.cantidad;
                    }

                    for (const promocion of carrito.promociones) {
                        const promoDB = await Promocion.findById(promocion.idPromo);
                        totalCarrito += promoDB.precioPromo * promocion.cantidad;
                    }

                    // Guardar los cambios en la base de datos
                    return await carrito.save();
                } else {
                    throw new Error("Usuario no autenticado");
                }
            } catch (error) {
                console.error("Error al eliminar producto del carrito:", error);
                throw new Error(error.message);
            }
        },
        eliminarPromoDeCarrito: async (_, { idUsuario, idPromo }, ctx) => {
            try {
                if (ctx) {
                    const carrito = await Carrito.findOne({ idUsuario });

                    if (!carrito) {
                        throw new Error(`Carrito no encontrado para el usuario con ID ${idUsuario}`);
                    }

                    // Buscar la promoción en el carrito
                    const promoExistente = carrito.promociones.find(p => p.idPromo.toString() === idPromo);

                    if (!promoExistente) {
                        throw new Error(`Promoción con ID ${idPromo} no encontrada en el carrito`);
                    }

                    if (promoExistente.cantidad > 1) {
                        promoExistente.cantidad -= 1;
                    } else {
                        carrito.promociones = carrito.promociones.filter(p => p.idPromo.toString() !== idPromo);
                    }

                    if (carrito.promociones.length === 0 && carrito.productos.length === 0 && carrito.idLocal) {
                        carrito.idLocal = null;
                    }

                    let totalCarrito = 0;

                    for (const producto of carrito.productos) {
                        const productoDB = await Producto.findById(producto.idProducto);
                        totalCarrito += productoDB.precio * producto.cantidad;
                    }

                    for (const promocion of carrito.promociones) {
                        const promoDB = await Promocion.findById(promocion.idPromo);
                        totalCarrito += promoDB.precioPromo * promocion.cantidad;
                    }

                    carrito.total = totalCarrito;

                    return await carrito.save();
                } else {
                    throw new Error("Usuario no autenticado");
                }
            } catch (error) {
                console.error("Error al eliminar promoción del carrito:", error);
                throw new Error(error.message);
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
                carrito.idLocal = null;

                return await carrito.save();
            } catch (error) {
                throw new Error(`Error al vaciar el carrito: ${error.message}`);
            }
        },

        confirmarCarrito: async (_, { idUsuario, qr }, ctx) => {
            try {
                if (ctx) {
                    const carrito = await Carrito.findOne({ idUsuario });

                    if (!carrito || (carrito.productos.length === 0 && carrito.promociones.length === 0)) {
                        throw new Error("El carrito está vacío o no existe.");
                    }

                    // Validar productos en el carrito
                    for (const productoPedido of carrito.productos) {
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

                    // Validar promociones en el carrito
                    for (const promocion of carrito.promociones) {
                        const promoDB = await Promocion.findById(promocion.idPromo);
                        if (!promoDB) {
                            throw new Error(`Promoción con ID ${promocion.idPromo} no encontrada.`);
                        }

                        for (const productoPromo of promoDB.productos) {
                            const productoDB = await Producto.findById(productoPromo.idProducto);
                            const cantidadTotal = promocion.cantidad * productoPromo.cantidad;

                            if (productoDB.stock < cantidadTotal) {
                                throw new Error(
                                    `No se puede procesar la promoción ${promoDB.nombre}. Stock insuficiente para el producto ${productoDB.nombre}. ` +
                                    `Stock disponible: ${productoDB.stock}, solicitado: ${cantidadTotal}`
                                );
                            }
                        }
                    }

                    // Crear el pedido
                    const pedido = new Pedido({
                        idCliente: idUsuario,
                        idLocal: carrito.idLocal,
                        productos: carrito.productos,
                        promociones: carrito.promociones,
                        qr: qr,
                    });

                    const nuevoPedido = await pedido.save();

                    // Actualizar stock de productos
                    for (const productoPedido of carrito.productos) {
                        await Producto.findByIdAndUpdate(productoPedido.idProducto, {
                            $inc: { stock: -productoPedido.cantidad },
                        });
                    }

                    // Actualizar stock de productos en promociones
                    for (const promocion of carrito.promociones) {
                        const promoDB = await Promocion.findById(promocion.idPromo);

                        for (const productoPromo of promoDB.productos) {
                            const cantidadTotal = promocion.cantidad * productoPromo.cantidad;

                            await Producto.findByIdAndUpdate(productoPromo.idProducto, {
                                $inc: { stock: -cantidadTotal },
                            });
                        }
                    }

                    // Registrar deuda en Libélula si es QR
                    if (qr) {
                        const productosDescripcion = [
                            {
                                concepto: "Pedido Ratatula", // Descripción general del pedido
                                cantidad: 1, // Siempre 1, ya que representa el pedido completo
                                costo_unitario: nuevoPedido.total, // Total del pedido
                            },
                        ];

                        const deudaRequest = {
                            appkey: "11bb10ce-68ba-4af1-8eb7-4e6624fed729",
                            email_cliente: ctx.usuario.correo,
                            identificador: nuevoPedido._id.toString(),
                            descripcion: `Pedido ${nuevoPedido._id}`,
                            nombre_cliente: ctx.usuario.nombre,
                            apellido_cliente: ctx.usuario.apellido,
                            fecha_vencimiento: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos de vencimiento
                            lineas_detalle_deuda: productosDescripcion,
                            callback_url: `http://34.16.100.239:4000/api/pago-exitoso`,
                        };

                        try {
                            const response = await axios.post(
                                "https://api.libelula.bo/rest/deuda/registrar",
                                deudaRequest,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            );

                            const { id_transaccion, qr_simple_url } = response.data;

                            if (qr_simple_url) {
                                await Pedido.findByIdAndUpdate(nuevoPedido._id, {
                                    urlqr: qr_simple_url,
                                    transaccionID: id_transaccion,
                                });
                            } else {
                                throw new Error("No se generó el QR Simple URL.");
                            }
                        } catch (error) {
                            console.error("Error al registrar deuda en Libélula:", error.response?.data || error.message);
                            throw new Error("No se pudo registrar la deuda en la pasarela de pagos.");
                        }
                    }

                    carrito.productos = [];
                    carrito.promociones = [];
                    carrito.total = 0;
                    carrito.fechaActualizacion = new Date();
                    carrito.idLocal = null;
                    await carrito.save();

                    return nuevoPedido;
                } else {
                    throw new Error("Prohibido: No autenticado");
                }
            } catch (error) {
                console.error(error.message);
                throw new Error(`Error al confirmar el carrito: ${error.message}`);
            }
        },
    },
};

module.exports = resolvers;