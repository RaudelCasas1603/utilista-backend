const express = require("express");
const router = express.Router();
const controller = require("./clientes.controller");

router.get("/", controller.getClientes);
router.get("/:id", controller.getClienteById);
router.get("/:id/ventas", controller.getUltimasVentasCliente);

router.post("/", controller.createCliente);
router.put("/:id", controller.updateCliente);
router.patch("/:id/estatus", controller.updateEstatus);
router.delete("/:id", controller.deleteCliente);

module.exports = router;
