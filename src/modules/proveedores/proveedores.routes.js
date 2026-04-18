const express = require("express");
const router = express.Router();
const controller = require("./proveedores.controller");

router.get("/", controller.getProveedores);
router.get("/:id", controller.getProveedorById);
router.post("/", controller.createProveedor);
router.put("/:id", controller.updateProveedor);
router.delete("/:id", controller.deleteProveedor);

// PRO
router.patch("/:id/estatus", controller.updateEstatus);

module.exports = router;
