const fetch = require("node-fetch");

const libelulaCallback = async (req, res) => {
    try {
        const { transaction_id } = req.query;

        if (!transaction_id) {
            console.error("Falta el parámetro transaction_id en la solicitud.");
            return res.status(400).json({ error: "transaction_id es requerido." });
        }

        const endpointGraphQL = "http://localhost:4000/graphql";
        const query = `
            mutation {
                nuevaNotaDeVentaQR(transaction_id: "${transaction_id}") {
                    id
                    idPedido
                    metodo
                    montoTotal
                    fechaPago
                }
            }
        `;

        const response = await fetch(endpointGraphQL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Respuesta de GraphQL:", result);
            return res.status(200).json({ message: "Pago procesado exitosamente." });
        } else {
            console.error("Error en GraphQL:", result.errors);
            throw new Error(result.errors?.[0]?.message || "Error procesando el pago.");
        }
    } catch (error) {
        console.error("Error al procesar pago exitoso:", error.message);
        return res.status(500).json({ error: "Error interno al procesar el pago." });
    }
};

module.exports = libelulaCallback;
