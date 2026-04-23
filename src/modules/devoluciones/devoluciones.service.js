const repo = require("./devoluciones.repository");

async function crearDevolucion(data) {
  return await repo.crearDevolucion(data);
}

async function getAllDevoluciones() {
  return await repo.getAllDevoluciones();
}

async function getDevolucionById(id) {
  return await repo.getDevolucionById(id);
}

module.exports = {
  crearDevolucion,
  getAllDevoluciones,
  getDevolucionById,
};
