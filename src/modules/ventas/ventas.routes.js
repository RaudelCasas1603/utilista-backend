const express = require("express");
const router = express.Router();

const {
  getVentasPendientes,
  getVentaById,
  createVenta,
  updateVenta,
  cancelarVenta,
  finalizarVenta,
  getVentasFinalizadas,
} = require("./ventas.controller");

router.get("/finalizadas", getVentasFinalizadas);
router.get("/pendientes", getVentasPendientes);
router.get("/:id", getVentaById);
router.post("/", createVenta);
router.put("/:id", updateVenta);
router.post("/:id/cancelar", cancelarVenta);
router.post("/:id/finalizar", finalizarVenta);

module.exports = router;
