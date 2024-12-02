const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config({ path: "variables.env" });
const conectarDB = require("./config/db");
const typeDefs = require("./db/schemas");
const resolvers = require("./db/resolvers");

const verificarPedidosPendientes = require("./utils/verificarPedidos");
const jwt = require("jsonwebtoken");
const libelulaCallback = require("./utils/libelulaCallback");

// Conectar a la base de datos
conectarDB();

// Ejecutar la verificación periódica
setInterval(verificarPedidosPendientes, 5 * 60 * 1000);
verificarPedidosPendientes();

(async () => {
    const app = express();

    app.get("/api/pago-exitoso", libelulaCallback);

    const servidor = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const token = req.headers["authorization"];
            if (token) {
                try {
                    const usuario = jwt.verify(token, process.env.FIRMA_SECRETA);
                    return {
                        usuario,
                    };
                } catch (e) {
                    console.error("Token no válido", e);
                }
            }
        },
    });

    await servidor.start();

    // Middleware de Apollo Server
    servidor.applyMiddleware({ app });

    // Levantar el servidor en el mismo puerto
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Servidor GraphQL ejecutándose en http://localhost:${PORT}${servidor.graphqlPath}`);
        console.log(`Endpoint REST listo en http://localhost:${PORT}/api/pago-exitoso`);
    });
})();