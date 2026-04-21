const express = require("express");
const router = express.Router();

const {
  getReporteVentasResumen,
  getReporteVentasPorDia,
  getReporteVentasMetodosPago,
  getReporteVentasTopProductos,
  getReporteVentasCompleto,
} = require("./ventas.controller");

router.get("/resumen", getReporteVentasResumen);
router.get("/por-dia", getReporteVentasPorDia);
router.get("/metodos-pago", getReporteVentasMetodosPago);
router.get("/top-productos", getReporteVentasTopProductos);
router.get("/completo", getReporteVentasCompleto);

module.exports = router;
