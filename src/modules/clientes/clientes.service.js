const repository = require("./clientes.repository");

async function obtenerClientes() {
  return await repository.getAll();
}

async function obtenerClientePorId(id) {
  const cliente = await repository.getById(id);

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  return cliente;
}

async function crearCliente(data) {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (Number(data.descuento || 0) < 0) {
    throw new Error("El descuento no puede ser negativo");
  }

  return await repository.create({
    nombre: data.nombre.trim(),
    telefono: data.telefono?.trim() || "",
    correo: data.correo?.trim() || "",
    descuento: Number(data.descuento || 0),
    referencia: data.referencia?.trim() || "",
    estatus: data.estatus || "activo",
  });
}

async function actualizarCliente(id, data) {
  const clienteExistente = await repository.getById(id);

  if (!clienteExistente) {
    throw new Error("Cliente no encontrado");
  }

  if (Number(data.descuento || 0) < 0) {
    throw new Error("El descuento no puede ser negativo");
  }

  return await repository.update(id, {
    nombre: data.nombre?.trim() || "",
    telefono: data.telefono?.trim() || "",
    correo: data.correo?.trim() || "",
    descuento: Number(data.descuento || 0),
    referencia: data.referencia?.trim() || "",
    estatus: data.estatus || "activo",
  });
}

async function eliminarCliente(id) {
  const cliente = await repository.remove(id);

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  return cliente;
}

async function cambiarEstatus(id, estatus) {
  const clienteExistente = await repository.getById(id);

  if (!clienteExistente) {
    throw new Error("Cliente no encontrado");
  }

  return await repository.updateEstatus(id, estatus);
}

async function obtenerUltimasVentasCliente(idCliente, limit = 8) {
  const clienteExistente = await repository.getById(idCliente);

  if (!clienteExistente) {
    throw new Error("Cliente no encontrado");
  }

  return await repository.getUltimasVentasPorCliente(idCliente, limit);
}

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  cambiarEstatus,
  obtenerUltimasVentasCliente,
};
