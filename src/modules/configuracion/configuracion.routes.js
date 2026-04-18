const express = require("express");
const router = express.Router();
const controller = require("./configuracion.controller");

router.get("/", controller.getConfiguracion);
router.put("/", controller.updateConfiguracion);

module.exports = router;
