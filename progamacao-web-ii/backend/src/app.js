import express from "express";
import prisma from "./database.js";
import { cadastrarCliente, editarCliente } from "./cliente/clienteController.js";// Importe das funções cadastrar cliente
const app = express();

app.use(express.json());

app.listen(3000, async () => {
    console.log("Servidor rodando na porta 3000");

    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Banco de dados conectado!");
    } catch (error) {
        console.error("Erro ao acessar o banco:", error);
    }
});
app.post("/clientes", cadastrarCliente); // rota para  cadastrar
app.put("/clientes/:id", editarCliente);// rota para editar 