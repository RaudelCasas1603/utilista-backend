const repository = require("./mov_inventario.repository");

async function getMovimientosByProducto({ id_producto, page, limit }) {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 6, 1);

  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new Error("El id_producto no es válido");
  }

  const result = await repository.getMovimientosByProducto({
    id_producto,
    page: pageNumber,
    limit: limitNumber,
  });

  return {
    page: pageNumber,
    limit: limitNumber,
    total: Number(result.total || 0),
    totalPages: Math.ceil(Number(result.total || 0) / limitNumber) || 1,
    data: result.rows,
  };
}

module.exports = {
  getMovimientosByProducto,
};
