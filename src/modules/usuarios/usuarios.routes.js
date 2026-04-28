const express = require("express");
const router = express.Router();

const usuariosController = require("./usuarios.controller");

router.post("/login", usuariosController.login);

router.get("/", usuariosController.getUsuarios);
router.get("/:id", usuariosController.getUsuarioById);

router.post("/", usuariosController.createUsuario);

router.put("/:id", usuariosController.updateUsuario);

router.patch("/:id/password", usuariosController.updatePassword);
router.patch("/:id/estatus", usuariosController.updateEstatus);

module.exports = router;
