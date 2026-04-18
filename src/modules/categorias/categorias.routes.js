const express = require("express");
const router = express.Router();
const controller = require("./categorias.controller");

router.get("/", controller.getCategorias);
router.get("/:id", controller.getCategoriaById);
router.post("/", controller.createCategoria);
router.put("/:id", controller.updateCategoria);
router.delete("/:id", controller.deleteCategoria);
router.patch("/:id/estatus", controller.updateEstatus);

module.exports = router;
