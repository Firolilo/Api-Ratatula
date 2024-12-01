const { gql } = require('apollo-server');

const typeDefs = gql`
# -- Query -- #
type Query {
    # -- Usuario -- #
    obtenerUsuario(token:String): Usuario
    
    obtenerUsuarios: [Usuario]
    obtenerUsuarioPorID(id: ID!): Usuario
    
    # -- Locales -- #
    obtenerLocales: [Usuario]
    
    # -- Solicitud -- #
    obtenerSolicitudes: [Usuario]
    obtenerSolicitudPorID(id: ID!): Usuario

    # -- Producto -- #
    obtenerProductos: [Producto]
    obtenerProductoPorID(id: ID!): Producto
    
    obtenerProductosLocal(idLocal: ID!): [Producto]

    # -- Promociones -- #
    obtenerPromociones: [Promocion]
    obtenerPromocionPorID(id: ID!): Promocion
    
    obtenerPromocionesLocal(idLocal: ID!): [Promocion]

    # -- Carrito -- #
    obtenerCarrito(idUsuario: ID!): CarritoCompras

    # -- Pedido -- #
    obtenerPedidos: [Pedido]
    obtenerPedidoPorID(id: ID!): Pedido
    
    #- Cliente
    
    obtenerPedidosClienteEntregado(id: ID!): [Pedido]
    obtenerPedidosClienteNEntregado(id: ID!): [Pedido]
    
    #- Local

    obtenerPedidosLocalPendiente(id: ID!): [Pedido]
    obtenerPedidosLocalCompletado(id: ID!): [Pedido]

    # -- Nota de Venta -- #
    obtenerNotasDeVenta: [NotaDeVenta]
    obtenerNotaDeVentaPorID(id: ID!): NotaDeVenta

    # -- Reporte -- #
    obtenerReportes(idLocal: ID!): [Reporte]
}

# -- Types -- #
type Usuario {
    id: ID
    nombre: String
    apellido: String
    correo: String
    rol: String
    estado: String
    telefono: String
    fechaRegistro: String
    descripcion: String
    categoria: [String]
    horarios: Horarios
}

type Horarios {
    apertura: String
    cierre: String
}

type Producto {
    id: ID
    nombre: String
    descripcion: String
    precio: Float
    stock: Int
    idLocal: ID
}

type Promocion {
    id: ID
    nombre: String
    descripcion: String
    precioReal: Float
    precioPromo: Float
    productos: [ProductoEnPromocion]
    imagen: String
    idLocal: ID
}

type ProductoEnPromocion {
    idProducto: ID
    cantidad: Int
}

type CarritoCompras {
    id: ID
    idUsuario: ID
    productos: [ProductoEnCarrito]
    promociones: [PromocionEnCarrito]
    total: Float
    fechaActualizacion: String
    idLocal: ID
}

type ProductoEnCarrito {
    idProducto: ID
    cantidad: Int
}

type PromocionEnCarrito {
    idPromo: ID
    cantidad: Int
}

type Pedido {
    id: ID
    idCliente: ID
    idLocal: ID
    productos: [ProductoEnPedido]
    promociones: [PromocionEnPedido]
    tiempoPreparacion: Int
    estado: String
    estadoVenta: String
    total: Float
    fechaCreacion: String
    urlqr: String
    qr: Boolean
    transaccionID: String
}

type ProductoEnPedido {
    idProducto: ID
    cantidad: Int
}

type PromocionEnPedido {
    idPromo: ID
    cantidad: Int
}

type NotaDeVenta {
    id: ID
    idPedido: ID
    metodo: String
    montoTotal: Float
    montoPagado: Float
    cambio: Float
    fechaPago: String
}

type Reporte {
    id: ID
    idLocal: ID
    fechaInicio: String
    fechaFin: String
    ventasTotales: Float
    pedidosCompletados: Int
    pedidosVendidos: [ID]
}

type Token {
    token: String
}

# -- Inputs -- #
input UsuarioInput {
    nombre: String!
    apellido: String
    correo: String!
    password: String!
    rol: String!
    telefono: String!
    descripcion: String
    categoria: [String]
    horarios: HorariosLocalInput
}

input HorariosLocalInput {
    apertura: String!
    cierre: String!
}

input ProductoInput {
    nombre: String!
    descripcion: String
    precio: Float!
    stock: Int!
    idLocal: ID!
    imagen: String
}

input PromocionInput {
    nombre: String!
    descripcion: String
    precioPromo: Float!
    productos: [ProductoEnPromocionInput!]!
    idLocal: ID!
    imagen: String
}

input ProductoEnPromocionInput {
    idProducto: ID!
    cantidad: Int!
}

input PedidoInput {
    idCliente: ID!
    idLocal: ID!
    productos: [ProductoEnPedidoInput!]!
    qr: Boolean
}

input ProductoEnPedidoInput {
    idProducto: ID!
    cantidad: Int!
}

input NotaDeVentaInput {
    idPedido: ID!
    metodo: String!
    montoPagado: Float!
}

input ReporteInput {
    idLocal: ID!
    fechaInicio: String!
    fechaFin: String!
}

input ProductoEnCarritoInput {
    idProducto: ID!
    cantidad: Int!
}
input PromoEnCarritoInput {
    idPromo: ID!
    cantidad: Int!
}

input inputAutenticar{
    correo: String
    password: String
}



# -- Mutation -- #
type Mutation {
    # -- Usuario -- #
    nuevoUsuario(input: UsuarioInput): Usuario
    actualizarUsuario(id: ID!, input: UsuarioInput): Usuario
    eliminarUsuario(id: ID!): String
    
    autenticarUsuario(input: inputAutenticar) : Token
    
    # -- Locales -- #

    # -- Producto -- #
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # -- Promocion -- #
    nuevaPromocion(input: PromocionInput): Promocion
    eliminarPromocion(id: ID!): String

    # -- Pedido -- #
    nuevoPedido(input: PedidoInput): Pedido
    actualizarEstadoPedido(id: ID!, estado: String!): Pedido
    actualizarEstadoVentaPedido(id: ID!, estadoVenta: String!): Pedido
    eliminarPedido(id: ID!): String
    
    actualizarTiempoPedido(id: ID!, tiempoPreparacion: Int!): Pedido

    # -- Nota de Venta -- #
    nuevaNotaDeVenta(input: NotaDeVentaInput): NotaDeVenta
    
    nuevaNotaDeVentaQR(transaction_id: String): NotaDeVenta
    
    # -- Solicitud -- #
    nuevaSolicitud(input: UsuarioInput): Usuario
    
    # -- Reporte -- #
    nuevoReporte(input: ReporteInput): Reporte
    
    # -- Carrito -- #
    agregarProductoACarrito(idUsuario: ID!, producto: ProductoEnCarritoInput!): CarritoCompras
    agregarPromoACarrito(idUsuario: ID!, producto: PromoEnCarritoInput!): CarritoCompras
    eliminarProductoDeCarrito(idUsuario: ID!, idProducto: ID!): CarritoCompras
    eliminarPromoDeCarrito(idUsuario: ID!, idPromo: ID!): CarritoCompras
    vaciarCarrito(idUsuario: ID!): CarritoCompras
    confirmarCarrito(idUsuario: ID!): Pedido
}
`;

module.exports = typeDefs;
