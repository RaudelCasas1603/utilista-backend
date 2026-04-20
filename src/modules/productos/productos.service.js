const repo = require("./productos.repository");

function calcularGanancia(compra, venta) {
  if (!compra) return 0;
  return ((venta - compra) / compra) * 100;
}

async function crearProducto(data) {
  if (!data.nombre) throw new Error("Nombre obligatorio");

  const compra = Number(data.precio_compra || 0);
  const venta = Number(data.precio_venta || 0);

  return await repo.createProducto({
    ...data,
    precio_compra: compra,
    precio_venta: venta,
    porcentaje_ganancia: calcularGanancia(compra, venta),
  });
}

async function actualizarProducto(id, data) {
  const existente = await repo.getProductoById(id);
  if (!existente) throw new Error("No existe");

  const compra = Number(data.precio_compra ?? existente.precio_compra);
  const venta = Number(data.precio_venta ?? existente.precio_venta);

  return await repo.updateProducto(id, {
    ...existente,
    ...data,
    porcentaje_ganancia: calcularGanancia(compra, venta),
  });
}

async function obtenerHistorialVentasUltimos7Dias(id) {
  const existente = await repo.getProductoById(id);
  if (!existente) throw new Error("No existe");

  return await repo.getHistorialVentasUltimos7Dias(id);
}

module.exports = {
  crearProducto,
  actualizarProducto,
  obtenerProductos: repo.getAllProductos,
  obtenerProductoPorId: repo.getProductoById,
  eliminarProducto: repo.deleteProducto,
  obtenerPorCodigoBarras: repo.getByCodigoBarras,
  obtenerHistorialVentasUltimos7Dias,
};
