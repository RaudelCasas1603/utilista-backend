const usuariosService = require("./usuarios.service");

async function login(req, res) {
  try {
    const usuario = await usuariosService.login(req.body);

    res.json({
      ok: true,
      message: "Login correcto",
      usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al iniciar sesión",
    });
  }
}

async function getUsuarios(req, res) {
  try {
    const usuarios = await usuariosService.getUsuarios({
      search: req.query.search,
    });

    res.json({
      ok: true,
      data: usuarios,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al obtener usuarios",
    });
  }
}

async function getUsuarioById(req, res) {
  try {
    const usuario = await usuariosService.getUsuarioById(req.params.id);

    res.json({
      ok: true,
      data: usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al obtener usuario",
    });
  }
}

async function createUsuario(req, res) {
  try {
    const usuario = await usuariosService.createUsuario(req.body);

    res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al crear usuario",
    });
  }
}

async function updateUsuario(req, res) {
  try {
    const usuario = await usuariosService.updateUsuario(
      req.params.id,
      req.body,
    );

    res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al actualizar usuario",
    });
  }
}

async function updatePassword(req, res) {
  try {
    const usuario = await usuariosService.updatePassword(
      req.params.id,
      req.body,
    );

    res.json({
      ok: true,
      message: "Contraseña actualizada correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al actualizar contraseña",
    });
  }
}

async function updateEstatus(req, res) {
  try {
    const usuario = await usuariosService.updateEstatus(
      req.params.id,
      req.body,
    );

    res.json({
      ok: true,
      message: "Estatus actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error al actualizar estatus",
    });
  }
}

module.exports = {
  login,
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updatePassword,
  updateEstatus,
};
