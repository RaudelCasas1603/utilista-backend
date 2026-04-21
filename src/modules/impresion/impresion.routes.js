const express = require("express");
const router = express.Router();
const controller = require("./impresion.controller");

router.post("/ticket/:idVenta", controller.imprimirTicketVenta);

module.exports = router;
