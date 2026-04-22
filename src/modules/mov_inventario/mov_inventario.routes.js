const express = require("express");
const router = express.Router();
const controller = require("./mov_inventario.controller");

router.get("/producto/:id_producto", controller.getMovimientosByProducto);

module.exports = router;
