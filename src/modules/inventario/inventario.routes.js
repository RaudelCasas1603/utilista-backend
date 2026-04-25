const express = require("express");
const router = express.Router();
const controller = require("./inventario.controller");

router.get("/reportes/proveedores", controller.getProveedoresReporteInventario);
router.get("/reportes/faltantes", controller.getReporteInventario);

router.get(
  "/reportes/faltantes/excel",
  controller.exportarReporteInventarioExcel,
);

router.get("/", controller.getInventario);
router.get("/producto/:id_producto", controller.getInventarioByProductoId);
router.get("/:id", controller.getInventarioById);
router.post("/", controller.createInventario);
router.put("/:id", controller.updateInventario);
router.delete("/:id", controller.deleteInventario);

module.exports = router;
