const express = require("express");
const router = express.Router();
const controller = require("./devoluciones.controller");

router.get("/", controller.getAllDevoluciones);
router.get("/:id", controller.getDevolucionById);
router.post("/", controller.crearDevolucion);

module.exports = router;
