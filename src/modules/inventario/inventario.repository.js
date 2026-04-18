const pool = require("../../config/db");

async function getAllInventario() {
  const result = await pool.query(`
    SELECT
      i.id,
      i.id_producto,
      i.stock_actual,
      i.stock_minimo,
      i.stock_deseado,
      p.codigo_producto,
      p.nombre
    FROM inventario i
    INNER JOIN productos p ON p.id = i.id_producto
    ORDER BY i.id ASC
  `);

  return result.rows;
}

async function getInventarioById(id) {
  const result = await pool.query(
    `
    SELECT
      i.id,
      i.id_producto,
      i.stock_actual,
      i.stock_minimo,
      i.stock_deseado,
      p.codigo_producto,
      p.codigo_barras,
      p.precio_venta,
      p.nombre
    FROM inventario i
    INNER JOIN productos p ON p.id = i.id_producto
    WHERE i.id = $1
    `,
    [id],
  );

  return result.rows[0];
}

async function getInventarioByProductoId(id_producto) {
  const result = await pool.query(
    `
    SELECT
      i.id,
      i.id_producto,
      i.stock_actual,
      i.stock_minimo,
      i.stock_deseado,
    p.codigo_producto,
      p.codigo_barras,
      p.precio_venta,
      p.nombre
    FROM inventario i
    INNER JOIN productos p ON p.id = i.id_producto
    WHERE i.id_producto = $1
    `,
    [id_producto],
  );

  return result.rows[0];
}

async function createInventario(data) {
  const result = await pool.query(
    `
    INSERT INTO inventario (
      id_producto,
      stock_actual,
      stock_minimo,
      stock_deseado
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      data.id_producto,
      data.stock_actual,
      data.stock_minimo,
      data.stock_deseado,
    ],
  );

  return result.rows[0];
}

async function updateInventario(id, data) {
  const result = await pool.query(
    `
    UPDATE inventario
    SET
      id_producto = $1,
      stock_actual = $2,
      stock_minimo = $3,
      stock_deseado = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `,
    [
      data.id_producto,
      data.stock_actual,
      data.stock_minimo,
      data.stock_deseado,
      id,
    ],
  );

  return result.rows[0];
}

async function deleteInventario(id) {
  const result = await pool.query(
    `DELETE FROM inventario WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
}

module.exports = {
  getAllInventario,
  getInventarioById,
  getInventarioByProductoId,
  createInventario,
  updateInventario,
  deleteInventario,
};
