const pool = require("../../config/db");

async function getAllProductos() {
  const res = await pool.query(`
    SELECT
      p.*,
      COALESCE(i.stock_actual, 0) AS stock,
      COALESCE(i.stock_minimo, 0) AS stock_minimo,
      COALESCE(i.stock_deseado, 0) AS stock_deseado
    FROM productos p
    LEFT JOIN inventario i
      ON i.id_producto = p.id
    ORDER BY p.id ASC
  `);

  return res.rows;
}

async function getProductoById(id) {
  const res = await pool.query(
    `
    SELECT
      p.*,
      COALESCE(i.stock_actual, 0) AS stock,
      COALESCE(i.stock_minimo, 0) AS stock_minimo,
      COALESCE(i.stock_deseado, 0) AS stock_deseado
    FROM productos p
    LEFT JOIN inventario i
      ON i.id_producto = p.id
    WHERE p.id = $1
    `,
    [id],
  );

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
  try {
    const res = await pool.query(
      `
      WITH next_id AS (
        SELECT nextval(pg_get_serial_sequence('productos', 'id')) AS id
      )
      INSERT INTO productos (
        id,
        codigo_producto,
        codigo_barras,
        nombre,
        precio_compra,
        precio_venta,
        id_proveedor,
        id_categoria
      )
      SELECT
        next_id.id,
        COALESCE(
          NULLIF(TRIM($1), ''),
          'PROD-' || LPAD(next_id.id::text, 3, '0')
        ),
        NULLIF(TRIM($2), ''),
        $3,
        $4,
        $5,
        $6,
        $7
      FROM next_id
      RETURNING *
      `,
      [
        data.codigo_producto ?? "",
        data.codigo_barras ?? "",
        data.nombre,
        data.precio_compra,
        data.precio_venta,
        data.id_proveedor,
        data.id_categoria,
      ],
    );

    return res.rows[0];
  } catch (error) {
    console.error("ERROR AL CREAR PRODUCTO:", error);
    throw error;
  }
}

async function updateProducto(id, data) {
  const res = await pool.query(
    `UPDATE productos SET
      codigo_producto = COALESCE(NULLIF(TRIM($1), ''), codigo_producto),
      codigo_barras = NULLIF(TRIM($2), ''),
      nombre = $3,
      precio_compra = $4,
      precio_venta = $5,
      id_proveedor = $6,
      id_categoria = $7,
      updated_at = NOW()
    WHERE id = $8
    RETURNING *`,
    [
      data.codigo_producto ?? "",
      data.codigo_barras ?? "",
      data.nombre,
      data.precio_compra,
      data.precio_venta,
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

async function getHistorialVentasUltimos7Dias(idProducto) {
  const res = await pool.query(
    `
    WITH dias AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::date AS fecha
    ),
    ventas_por_dia AS (
      SELECT
        v.created_at::date AS fecha,
        SUM(dv.cantidad)::int AS unidades_vendidas
      FROM ventas_detalle dv
      INNER JOIN ventas v
        ON v.id = dv.id_venta
      WHERE dv.id_producto = $1
        AND v.created_at >= CURRENT_DATE - INTERVAL '6 days'
        AND v.created_at < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY v.created_at::date
    )
    SELECT
      d.fecha,
      COALESCE(vpd.unidades_vendidas, 0) AS unidades_vendidas
    FROM dias d
    LEFT JOIN ventas_por_dia vpd
      ON vpd.fecha = d.fecha
    ORDER BY d.fecha ASC
    `,
    [idProducto],
  );

  return res.rows;
}

module.exports = {
  getAllProductos,
  getProductoById,
  getByCodigoBarras,
  createProducto,
  updateProducto,
  deleteProducto,
  getHistorialVentasUltimos7Dias,
};
