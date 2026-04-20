const express = require("express");
const router = express.Router();

const {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  updateEstatus,
  getStatsByProveedor,
} = require("./proveedores.controller");

router.get("/", getProveedores);
router.get("/:id/stats", getStatsByProveedor);
router.get("/:id", getProveedorById);
router.post("/", createProveedor);
router.put("/:id", updateProveedor);
router.patch("/:id/estatus", updateEstatus);
router.delete("/:id", deleteProveedor);

module.exports = router;
