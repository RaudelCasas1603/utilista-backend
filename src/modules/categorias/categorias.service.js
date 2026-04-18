const repo = require("./categorias.repository");

async function obtenerCategorias() {
  return await repo.getAll();
}

async function obtenerCategoriaPorId(id) {
  const data = await repo.getById(id);

  if (!data) throw new Error("Categoría no encontrada");

  return data;
}

async function crearCategoria(data) {
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  return await repo.create({
    nombre: data.nombre,
    descripcion: data.descripcion || "",
    estatus: data.estatus || "activo",
  });
}

async function actualizarCategoria(id, data) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Categoría no encontrada");
  }

  return await repo.update(id, {
    ...existente,
    ...data,
  });
}

async function eliminarCategoria(id) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Categoría no encontrada");
  }

  return await repo.remove(id);
}

async function cambiarEstatus(id, estatus) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Categoría no encontrada");
  }

  return await repo.updateEstatus(id, estatus);
}

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  cambiarEstatus,
};
