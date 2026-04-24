const express = require("express");
const router = express.Router();
const controller = require("./impresion.controller");

router.post("/ticket/:idVenta", controller.imprimirTicketVenta);
router.get("/impresoras", controller.getImpresoras);
router.post("/corte-caja/:idCorteCaja", controller.imprimirCorteCaja);

module.exports = router;
