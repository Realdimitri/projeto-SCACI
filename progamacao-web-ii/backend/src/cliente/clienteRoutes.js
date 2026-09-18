import express from "express";
import { cadastrarCliente, editarCliente, excluirCliente } from "./clienteController.js";

const router = express.Router();

router.post("/cliente", cadastrarCliente);

router.delete("/cliente/:id_cliente", excluirCliente);

router.put("/cliente/:id_cliente", editarCliente);

export default router;