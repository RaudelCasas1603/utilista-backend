const bcrypt = require("bcrypt");
const usuariosRepository = require("./usuarios.repository");

async function login({ username, password }) {
  if (!username || !password) {
    const error = new Error("Usuario y contraseña son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await usuariosRepository.findByUsername(username);

  if (!usuario) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.statusCode = 401;
    throw error;
  }

  if (usuario.estatus !== "activo") {
    const error = new Error("El usuario está inactivo");
    error.statusCode = 403;
    throw error;
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordValida) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.statusCode = 401;
    throw error;
  }

  const usuarioActualizado = await usuariosRepository.updateUltimoAcceso(
    usuario.id,
  );

  return usuarioActualizado;
}

async function getUsuarios({ search }) {
  return usuariosRepository.findAll({ search });
}

async function getUsuarioById(id) {
  const usuario = await usuariosRepository.findById(id);

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return usuario;
}

async function createUsuario(data) {
  const { nombre, username, password, rol } = data;

  if (!nombre || !username || !password || !rol) {
    const error = new Error(
      "Nombre, username, password y rol son obligatorios",
    );
    error.statusCode = 400;
    throw error;
  }

  const existe = await usuariosRepository.findByUsername(username);

  if (existe) {
    const error = new Error("El username ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);

  return usuariosRepository.createUsuario({
    nombre,
    username,
    password_hash,
    rol,
  });
}

async function updateUsuario(id, data) {
  const { nombre, username, rol } = data;

  if (!nombre || !username || !rol) {
    const error = new Error("Nombre, username y rol son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await usuariosRepository.updateUsuario(id, {
    nombre,
    username,
    rol,
  });

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return usuario;
}

async function updatePassword(id, data) {
  const { password } = data;

  if (!password) {
    const error = new Error("La nueva contraseña es obligatoria");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("La contraseña debe tener mínimo 6 caracteres");
    error.statusCode = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await usuariosRepository.updatePassword(id, password_hash);

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return usuario;
}

async function updateEstatus(id, data) {
  const { estatus } = data;

  if (!estatus) {
    const error = new Error("El estatus es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  if (!["activo", "inactivo"].includes(estatus)) {
    const error = new Error("Estatus inválido");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await usuariosRepository.updateEstatus(id, estatus);

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return usuario;
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
