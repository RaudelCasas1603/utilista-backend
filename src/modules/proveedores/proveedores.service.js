const repo = require("./proveedores.repository");

async function obtenerProveedores() {
  return await repo.getAll();
}

async function obtenerProveedorPorId(id) {
  const data = await repo.getById(id);

  if (!data) throw new Error("Proveedor no encontrado");

  return data;
}

async function crearProveedor(data) {
  if (!data.empresa) {
    throw new Error("La empresa es obligatoria");
  }

  return await repo.create({
    nombre: data.nombre || "",
    telefono: data.telefono || "",
    correo: data.correo || "",
    empresa: data.empresa,
    referencia: data.referencia || "",
    estatus: data.estatus || "activo",
  });
}

async function actualizarProveedor(id, data) {
  const existente = await repo.getById(id);
  if (!existente) throw new Error("Proveedor no encontrado");

  return await repo.update(id, {
    ...existente,
    ...data,
  });
}

async function eliminarProveedor(id) {
  const existente = await repo.getById(id);
  if (!existente) throw new Error("Proveedor no encontrado");

  return await repo.remove(id);
}

async function cambiarEstatus(id, estatus) {
  const existente = await repo.getById(id);
  if (!existente) throw new Error("Proveedor no encontrado");

  return await repo.updateEstatus(id, estatus);
}

async function getStatsByProveedor(id) {
  const existente = await repo.getById(id);
  if (!existente) throw new Error("Proveedor no encontrado");

  return await repo.getStatsByProveedor(id);
}

module.exports = {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  cambiarEstatus,
  getStatsByProveedor,
};
