const repo = require("./ventas.repository");

async function obtenerVentasPendientes() {
  return await repo.getPendientes();
}

async function obtenerVentaPorId(id) {
  const venta = await repo.getById(id);

  if (!venta) {
    throw new Error("Venta no encontrada");
  }

  return venta;
}

async function crearVenta(data) {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("La venta debe incluir al menos un producto");
  }

  if (!data.id_usuario) {
    throw new Error("El id_usuario es obligatorio");
  }

  const estatus = data.estatus || "pendiente";

  if (estatus === "finalizada" && !data.metodo_pago) {
    throw new Error(
      "El método de pago es obligatorio para una venta finalizada",
    );
  }

  const payload = {
    id_cliente: data.id_cliente || 1,
    id_usuario: Number(data.id_usuario),
    metodo_pago: estatus === "pendiente" ? null : data.metodo_pago,
    estatus,
    observaciones: data.observaciones || "",
    items: data.items,
  };

  return await repo.createVenta(payload);
}
async function actualizarVentaPendiente(id, data) {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("La venta debe incluir al menos un producto");
  }

  if (!data.id_usuario) {
    throw new Error("El id_usuario es obligatorio");
  }

  const payload = {
    id_cliente: data.id_cliente || 1,
    id_usuario: Number(data.id_usuario),
    metodo_pago: data.metodo_pago || null,
    estatus: data.estatus || "pendiente",
    observaciones: data.observaciones || "",
    items: data.items,
  };

  return await repo.updateVentaPendiente(id, payload);
}

async function cancelarVenta(id, id_usuario) {
  if (!id_usuario) {
    throw new Error("El id_usuario es obligatorio para cancelar");
  }

  return await repo.cancelarVenta(id, Number(id_usuario));
}

async function finalizarVenta(id, data) {
  if (!data.id_usuario) {
    throw new Error("El id_usuario es obligatorio para finalizar");
  }

  return await repo.finalizarVenta(id, {
    id_usuario: Number(data.id_usuario),
    metodo_pago: data.metodo_pago || null,
    observaciones: data.observaciones || "",
  });
}
const ventasRepository = require("./ventas.repository");

async function obtenerVentasFinalizadas() {
  return await ventasRepository.getVentasFinalizadas();
}

module.exports = {
  obtenerVentasPendientes,
  obtenerVentaPorId,
  crearVenta,
  actualizarVentaPendiente,
  cancelarVenta,
  finalizarVenta,
  obtenerVentasFinalizadas,
};
