const express = require("express");
const router = express.Router();

const corteCajaController = require("./corte-caja.controller");

router.get("/resumen-dia", corteCajaController.getResumenDia);

router.get("/", corteCajaController.getAllCortesCaja);
router.get("/:id", corteCajaController.getCorteCajaById);
router.post("/", corteCajaController.createCorteCaja);

module.exports = router;
