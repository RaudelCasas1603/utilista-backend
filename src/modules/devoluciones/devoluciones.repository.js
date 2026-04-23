const pool = require("../../config/db");

async function crearDevolucion(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const devolucionRes = await client.query(
      `
      INSERT INTO devoluciones (
        fecha_hora,
        id_venta,
        id_cliente,
        id_usuario,
        subtotal,
        total,
        motivo
      )
      VALUES (
        NOW(),
        $1,
        $2,
        $3,
        0,
        0,
        $4
      )
      RETURNING *
      `,
      [data.id_venta, data.id_cliente, data.id_usuario, data.motivo || null],
    );

    const devolucion = devolucionRes.rows[0];

    let subtotal = 0;

    for (const item of data.items) {
      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precio_unitario);
      const itemSubtotal = cantidad * precioUnitario;

      subtotal += itemSubtotal;

      await client.query(
        `
        INSERT INTO devoluciones_detalle (
          id_devolucion,
          id_producto,
          cantidad,
          precio_unitario,
          subtotal,
          motivo
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          devolucion.id,
          item.id_producto,
          cantidad,
          precioUnitario,
          itemSubtotal,
          item.motivo || null,
        ],
      );

      await client.query(
        `
        UPDATE inventario
        SET stock_actual = stock_actual + $1
        WHERE id_producto = $2
        `,
        [cantidad, item.id_producto],
      );
    }

    await client.query(
      `
      UPDATE devoluciones
      SET subtotal = $1,
          total = $1
      WHERE id = $2
      `,
      [subtotal, devolucion.id],
    );

    const devolucionFinalRes = await client.query(
      `
      SELECT
        d.*,
        c.nombre AS cliente_nombre,
        c.telefono AS cliente_telefono,
        c.correo AS cliente_correo
      FROM devoluciones d
      LEFT JOIN clientes c ON c.id = d.id_cliente
      WHERE d.id = $1
      `,
      [devolucion.id],
    );

    const detalleRes = await client.query(
      `
      SELECT
        dd.id,
        dd.id_devolucion,
        dd.id_producto,
        p.nombre,
        p.codigo_producto,
        dd.cantidad,
        dd.precio_unitario,
        dd.subtotal,
        dd.motivo
      FROM devoluciones_detalle dd
      INNER JOIN productos p ON p.id = dd.id_producto
      WHERE dd.id_devolucion = $1
      ORDER BY dd.id ASC
      `,
      [devolucion.id],
    );

    await client.query("COMMIT");

    return {
      ...devolucionFinalRes.rows[0],
      items: detalleRes.rows,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getAllDevoluciones() {
  const result = await pool.query(
    `
    SELECT
      d.id,
      d.fecha_hora,
      d.id_venta,
      d.id_cliente,
      d.id_usuario,
      d.subtotal,
      d.total,
      d.motivo,
      d.estatus,
      d.created_at,
      c.nombre AS cliente_nombre
    FROM devoluciones d
    LEFT JOIN clientes c ON c.id = d.id_cliente
    ORDER BY d.id DESC
    `,
  );

  return result.rows;
}

async function getDevolucionById(id) {
  const devolucionRes = await pool.query(
    `
    SELECT
      d.id,
      d.fecha_hora,
      d.id_venta,
      d.id_cliente,
      d.id_usuario,
      d.subtotal,
      d.total,
      d.motivo,
      d.estatus,
      d.created_at,
      c.nombre AS cliente_nombre,
      c.telefono AS cliente_telefono,
      c.correo AS cliente_correo
    FROM devoluciones d
    LEFT JOIN clientes c ON c.id = d.id_cliente
    WHERE d.id = $1
    `,
    [id],
  );

  const devolucion = devolucionRes.rows[0];

  if (!devolucion) {
    return null;
  }

  const detalleRes = await pool.query(
    `
    SELECT
      dd.id,
      dd.id_devolucion,
      dd.id_producto,
      p.nombre,
      p.codigo_producto,
      p.codigo_barras,
      dd.cantidad,
      dd.precio_unitario,
      dd.subtotal,
      dd.motivo
    FROM devoluciones_detalle dd
    INNER JOIN productos p ON p.id = dd.id_producto
    WHERE dd.id_devolucion = $1
    ORDER BY dd.id ASC
    `,
    [id],
  );

  return {
    ...devolucion,
    items: detalleRes.rows,
  };
}

module.exports = {
  crearDevolucion,
  getAllDevoluciones,
  getDevolucionById,
};
