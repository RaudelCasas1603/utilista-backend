const express = require("express");
const router = express.Router();

const {
  getConfiguracion,
  createConfiguracion,
  updateConfiguracion,
  saveConfiguracion,
} = require("./configuracion.controller");

router.get("/", getConfiguracion);
router.post("/", createConfiguracion);
router.put("/:id", updateConfiguracion);

// Este es el más cómodo para frontend:
// si no existe crea, si existe actualiza
router.put("/", saveConfiguracion);

module.exports = router;
