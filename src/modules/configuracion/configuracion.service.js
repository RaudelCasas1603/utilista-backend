const repo = require("./configuracion.repository");

async function obtenerConfiguracion() {
  let config = await repo.get();

  // Si no existe, crear una por defecto
  if (!config) {
    config = await repo.createDefault();
  }

  return config;
}

async function actualizarConfiguracion(data) {
  const existente = await repo.get();

  if (!existente) {
    throw new Error("Configuración no encontrada");
  }

  return await repo.update({
    ...existente,
    ...data,
  });
}

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
};
