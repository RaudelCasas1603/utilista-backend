// cobros/cobros.routes.js
const express = require("express");
const router = express.Router();
const cobrosController = require("./cobros.controller");

router.get("/pendientes", cobrosController.obtenerTicketsPendientes);
router.get("/pendientes/:id", cobrosController.obtenerDetalleTicket);
router.patch("/pendientes/:id/cobrar", cobrosController.cobrarTicket);

module.exports = router;
