const repo = require("./inventario.repository");

async function obtenerInventario() {
  return await repo.getAllInventario();
}

async function obtenerInventarioPorId(id) {
  const inventario = await repo.getInventarioById(id);

  if (!inventario) {
    throw new Error("Registro de inventario no encontrado");
  }

  return inventario;
}

async function obtenerInventarioPorProductoId(id_producto) {
  const inventario = await repo.getInventarioByProductoId(id_producto);

  if (!inventario) {
    throw new Error("Inventario del producto no encontrado");
  }

  return inventario;
}

async function crearInventario(data) {
  if (!data.id_producto) {
    throw new Error("id_producto es obligatorio");
  }

  const existente = await repo.getInventarioByProductoId(data.id_producto);
  if (existente) {
    throw new Error("Ese producto ya tiene inventario registrado");
  }

  const nuevoInventario = {
    id_producto: Number(data.id_producto),
    stock_actual: Number(data.stock_actual || 0),
    stock_minimo: Number(data.stock_minimo || 0),
    stock_deseado: Number(data.stock_deseado || 0),
  };

  return await repo.createInventario(nuevoInventario);
}

async function actualizarInventario(id, data) {
  const existente = await repo.getInventarioById(id);

  if (!existente) {
    throw new Error("Registro de inventario no encontrado");
  }

  const inventarioActualizado = {
    id_producto: Number(data.id_producto ?? existente.id_producto),
    stock_actual: Number(data.stock_actual ?? existente.stock_actual),
    stock_minimo: Number(data.stock_minimo ?? existente.stock_minimo),
    stock_deseado: Number(data.stock_deseado ?? existente.stock_deseado),
  };

  return await repo.updateInventario(id, inventarioActualizado);
}

async function eliminarInventario(id) {
  const existente = await repo.getInventarioById(id);

  if (!existente) {
    throw new Error("Registro de inventario no encontrado");
  }

  return await repo.deleteInventario(id);
}

module.exports = {
  obtenerInventario,
  obtenerInventarioPorId,
  obtenerInventarioPorProductoId,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
};
