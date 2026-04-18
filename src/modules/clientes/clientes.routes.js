const express = require("express");
const router = express.Router();
const controller = require("./clientes.controller");

router.get("/", controller.getClientes);
router.get("/:id", controller.getClienteById);
router.post("/", controller.createCliente);
router.put("/:id", controller.updateCliente);
router.delete("/:id", controller.deleteCliente);
router.patch("/:id/estatus", controller.updateEstatus);

module.exports = router;
