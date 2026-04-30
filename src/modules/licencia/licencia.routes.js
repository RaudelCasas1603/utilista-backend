const { Router } = require("express");

const {
  activarLicencia,
  validarLicencia,
  obtenerEstadoLicencia,
} = require("./licencia.controller");

const router = Router();

router.post("/activar", activarLicencia);
router.post("/validar", validarLicencia);
router.get("/estado", obtenerEstadoLicencia);

module.exports = router;
