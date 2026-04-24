const configuracionRepository = require("./configuracion.repository");

async function obtenerConfiguracion() {
  return await configuracionRepository.getConfiguracion();
}

async function crearConfiguracion(data) {
  return await configuracionRepository.createConfiguracion(data);
}

async function actualizarConfiguracion(id, data) {
  return await configuracionRepository.updateConfiguracion(id, data);
}

async function guardarConfiguracion(data) {
  return await configuracionRepository.upsertConfiguracion(data);
}

module.exports = {
  obtenerConfiguracion,
  crearConfiguracion,
  actualizarConfiguracion,
  guardarConfiguracion,
};
