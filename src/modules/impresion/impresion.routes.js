const express = require("express");
const router = express.Router();
const controller = require("./impresion.controller");

router.post("/ticket/:idVenta", controller.imprimirTicketVenta);
router.get("/impresoras", controller.getImpresoras);

module.exports = router;
