const pool = require("../../config/db");

async function getMovimientosByProducto({ id_producto, page, limit }) {
  const offset = (page - 1) * limit;

  const totalQuery = `
    SELECT COUNT(*) AS total
    FROM movimientos_inventario mi
    WHERE mi.id_producto = $1
  `;

  const dataQuery = `
    SELECT
      mi.id,
      mi.id_producto,
      mi.tipo_movimiento,
      mi.cantidad,
      mi.stock_anterior,
      mi.stock_nuevo,
      mi.motivo,
      mi.id_usuario,
      u.nombre AS usuario_nombre,
      mi.id_venta,
      mi.created_at
    FROM movimientos_inventario mi
    INNER JOIN usuarios u ON u.id = mi.id_usuario
    WHERE mi.id_producto = $1
    ORDER BY mi.created_at DESC, mi.id DESC
    LIMIT $2 OFFSET $3
  `;

  const [totalResult, dataResult] = await Promise.all([
    pool.query(totalQuery, [id_producto]),
    pool.query(dataQuery, [id_producto, limit, offset]),
  ]);

  return {
    total: totalResult.rows[0].total,
    rows: dataResult.rows,
  };
}

module.exports = {
  getMovimientosByProducto,
};
