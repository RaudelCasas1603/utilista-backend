const pool = require("../../config/db");

async function obtenerTicketsPendientes() {
  const query = `
    WITH detalle_limitado AS (
      SELECT
        vd.id_venta,
        vd.id,
        p.nombre AS producto,
        vd.cantidad,
        vd.subtotal,
        ROW_NUMBER() OVER (PARTITION BY vd.id_venta ORDER BY vd.id ASC) AS rn
      FROM ventas_detalle vd
      INNER JOIN productos p ON p.id = vd.id_producto
    ),
    total_productos AS (
      SELECT
        vd.id_venta,
        COUNT(*) AS total_productos
      FROM ventas_detalle vd
      GROUP BY vd.id_venta
    )
    SELECT
      v.id,
      v.folio,
      v.fecha_hora,
      v.id_cliente,
      COALESCE(c.nombre, 'Cliente general') AS cliente,
      v.subtotal,
      v.descuento,
      v.total,
      v.total_articulos,
      v.metodo_pago,
      v.estatus,
      v.observaciones,
      COALESCE(tp.total_productos, 0) AS total_productos,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', dl.id,
            'producto', dl.producto,
            'cantidad', dl.cantidad,
            'subtotal', dl.subtotal
          )
          ORDER BY dl.rn
        ) FILTER (WHERE dl.id IS NOT NULL),
        '[]'::json
      ) AS productos_preview
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    LEFT JOIN total_productos tp ON tp.id_venta = v.id
    LEFT JOIN detalle_limitado dl
      ON dl.id_venta = v.id
      AND dl.rn <= 4
    WHERE v.estatus = 'pendiente'
    GROUP BY
      v.id,
      v.folio,
      v.fecha_hora,
      v.id_cliente,
      c.nombre,
      v.subtotal,
      v.descuento,
      v.total,
      v.total_articulos,
      v.metodo_pago,
      v.estatus,
      v.observaciones,
      tp.total_productos
    ORDER BY v.fecha_hora ASC, v.id ASC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function obtenerTicketPendientePorId(id) {
  const query = `
    SELECT
      v.id,
      v.folio,
      v.fecha_hora,
      v.id_cliente,
      COALESCE(c.nombre, 'Cliente general') AS cliente,
      v.subtotal,
      v.descuento,
      v.total,
      v.total_articulos,
      v.metodo_pago,
      v.estatus,
      v.observaciones
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    WHERE v.id = $1
      AND v.estatus = 'pendiente'
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function obtenerDetalleCompletoTicket(idVenta) {
  const query = `
    SELECT
      vd.id,
      vd.id_venta,
      vd.id_producto,
      p.nombre AS producto,
      p.codigo_producto,
      p.codigo_barras,
      vd.cantidad,
      vd.precio_unitario,
      vd.descuento_unitario,
      vd.subtotal
    FROM ventas_detalle vd
    INNER JOIN productos p ON p.id = vd.id_producto
    WHERE vd.id_venta = $1
    ORDER BY vd.id ASC
  `;

  const result = await pool.query(query, [idVenta]);
  return result.rows;
}

async function cobrarTicket(id, metodo_pago, observaciones = null) {
  const query = `
    UPDATE ventas
    SET
      metodo_pago = $2,
      estatus = 'finalizada',
      observaciones = COALESCE($3, observaciones),
      updated_at = NOW()
    WHERE id = $1
      AND estatus = 'pendiente'
    RETURNING *
  `;

  const result = await pool.query(query, [id, metodo_pago, observaciones]);
  return result.rows[0];
}

module.exports = {
  obtenerTicketsPendientes,
  obtenerTicketPendientePorId,
  obtenerDetalleCompletoTicket,
  cobrarTicket,
};
