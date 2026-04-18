const pool = require("../../config/db");

async function getAllProductos() {
  const res = await pool.query(`SELECT * FROM productos`);
  return res.rows;
}

async function getProductoById(id) {
  const res = await pool.query(`SELECT * FROM productos WHERE id=$1`, [id]);
  return res.rows[0];
}

async function getByCodigoBarras(codigo) {
  const res = await pool.query(
    `SELECT * FROM productos WHERE codigo_barras=$1`,
    [codigo],
  );
  return res.rows[0];
}

async function createProducto(data) {
  const res = await pool.query(
    `INSERT INTO productos (
      codigo_producto,
      codigo_barras,
      nombre,
      precio_compra,
      precio_venta,
      porcentaje_ganancia,
      id_proveedor,
      id_categoria
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      data.codigo_producto,
      data.codigo_barras,
      data.nombre,
      data.precio_compra,
      data.precio_venta,
      data.porcentaje_ganancia,
      data.id_proveedor,
      data.id_categoria,
    ],
  );
  return res.rows[0];
}

async function updateProducto(id, data) {
  const res = await pool.query(
    `UPDATE productos SET
      codigo_producto=$1,
      codigo_barras=$2,
      nombre=$3,
      precio_compra=$4,
      precio_venta=$5,
      porcentaje_ganancia=$6,
      id_proveedor=$7,
      id_categoria=$8,
      updated_at=NOW()
    WHERE id=$9
    RETURNING *`,
    [
      data.codigo_producto,
      data.codigo_barras,
      data.nombre,
      data.precio_compra,
      data.precio_venta,
      data.porcentaje_ganancia,
      data.id_proveedor,
      data.id_categoria,
      id,
    ],
  );
  return res.rows[0];
}

async function deleteProducto(id) {
  const res = await pool.query(
    `DELETE FROM productos WHERE id=$1 RETURNING *`,
    [id],
  );
  return res.rows[0];
}

module.exports = {
  getAllProductos,
  getProductoById,
  getByCodigoBarras,
  createProducto,
  updateProducto,
  deleteProducto,
};
