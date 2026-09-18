import express from "express";
import prisma from "./database.js";
import clienteRoutes from "./cliente/clienteRoutes.js";


const app = express();

app.use(express.json());
app.use(clienteRoutes);


app.listen(3000, async () => {
    console.log("Servidor rodando na porta 3000");

    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Banco de dados conectado!");
    } catch (error) {
        console.error("Erro ao acessar o banco:", error);
    }
});