const repo = require("./clientes.repository");

async function obtenerClientes() {
  return await repo.getAll();
}

async function obtenerClientePorId(id) {
  const cliente = await repo.getById(id);

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  return cliente;
}

async function crearCliente(data) {
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  const descuento = Number(data.descuento || 0);

  if (descuento < 0) {
    throw new Error("El descuento no puede ser negativo");
  }

  return await repo.create({
    nombre: data.nombre,
    telefono: data.telefono || "",
    correo: data.correo || "",
    descuento,
    referencia: data.referencia || "",
    estatus: data.estatus || "activo",
  });
}

async function actualizarCliente(id, data) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Cliente no encontrado");
  }

  const descuento = Number(data.descuento ?? existente.descuento);

  if (descuento < 0) {
    throw new Error("El descuento no puede ser negativo");
  }

  return await repo.update(id, {
    ...existente,
    ...data,
    descuento,
  });
}

async function eliminarCliente(id) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Cliente no encontrado");
  }

  return await repo.remove(id);
}

async function cambiarEstatus(id, estatus) {
  const existente = await repo.getById(id);

  if (!existente) {
    throw new Error("Cliente no encontrado");
  }

  return await repo.updateEstatus(id, estatus);
}

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  cambiarEstatus,
};
