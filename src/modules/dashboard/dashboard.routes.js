const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

router.get("/resumen", dashboardController.getResumenDashboard);
router.get("/grafica-ventas", dashboardController.getGraficaVentas);
router.get("/grafica-margen", dashboardController.getGraficaMargen);
router.get("/ventas-categorias", dashboardController.getVentasPorCategoria);

module.exports = router;
