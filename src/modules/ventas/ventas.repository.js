const pool = require("../../config/db");

async function getPendientes() {
  const res = await pool.query(`
    SELECT
      v.id,
      v.folio,
      v.fecha_hora,
      v.total,
      v.total_articulos,
      c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    WHERE v.estatus = 'pendiente'
    ORDER BY v.fecha_hora DESC
  `);

  return res.rows;
}

async function getById(id) {
  const ventaRes = await pool.query(
    `
    SELECT
      v.*,
      c.nombre AS cliente_nombre,
      c.telefono AS cliente_telefono,
      c.correo AS cliente_correo
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    WHERE v.id = $1
    `,
    [id],
  );

  const venta = ventaRes.rows[0];
  if (!venta) return null;

  const detalleRes = await pool.query(
    `
    SELECT
      vd.id,
      vd.id_producto,
      p.nombre,
      p.codigo_producto,
      vd.cantidad,
      vd.precio_unitario,
      vd.descuento_unitario,
      vd.subtotal
    FROM ventas_detalle vd
    INNER JOIN productos p ON p.id = vd.id_producto
    WHERE vd.id_venta = $1
    ORDER BY vd.id ASC
    `,
    [id],
  );

  return {
    ...venta,
    items: detalleRes.rows,
  };
}

async function createVenta(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const clienteRes = await client.query(
      `SELECT id, descuento FROM clientes WHERE id = $1`,
      [data.id_cliente],
    );

    if (clienteRes.rows.length === 0) {
      throw new Error("Cliente no encontrado");
    }

    const cliente = clienteRes.rows[0];
    const descuentoCliente = Number(cliente.descuento || 0);

    let subtotal = 0;
    let totalArticulos = 0;
    const itemsProcesados = [];

    for (const item of data.items) {
      const productoRes = await client.query(
        `
        SELECT
          p.id,
          p.nombre,
          p.precio_venta,
          i.stock_actual
        FROM productos p
        INNER JOIN inventario i ON i.id_producto = p.id
        WHERE p.id = $1
        `,
        [item.id_producto],
      );

      if (productoRes.rows.length === 0) {
        throw new Error(`Producto con id ${item.id_producto} no encontrado`);
      }

      const producto = productoRes.rows[0];
      const cantidad = Number(item.cantidad);

      if (cantidad <= 0) {
        throw new Error(`Cantidad inválida para producto ${item.id_producto}`);
      }

      if (Number(producto.stock_actual) < cantidad) {
        throw new Error(
          `Stock insuficiente para el producto ${producto.nombre}`,
        );
      }

      const precioUnitario = Number(producto.precio_venta);
      const subtotalLinea = precioUnitario * cantidad;

      subtotal += subtotalLinea;
      totalArticulos += cantidad;

      itemsProcesados.push({
        id_producto: Number(producto.id),
        nombre: producto.nombre,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal: subtotalLinea,
        stock_anterior: Number(producto.stock_actual),
        stock_nuevo: Number(producto.stock_actual) - cantidad,
      });
    }

    const descuento = Number(((subtotal * descuentoCliente) / 100).toFixed(2));
    const total = Number((subtotal - descuento).toFixed(2));

    const folioRes = await client.query(
      `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ventas`,
    );
    const nextId = Number(folioRes.rows[0].next_id);
    const folio = `V-${String(nextId).padStart(5, "0")}`;

    const ventaRes = await client.query(
      `
      INSERT INTO ventas (
        folio,
        fecha_hora,
        id_cliente,
        id_usuario,
        subtotal,
        descuento,
        metodo_pago,
        total,
        total_articulos,
        estatus,
        observaciones
      )
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        folio,
        data.id_cliente,
        data.id_usuario,
        subtotal,
        descuento,
        data.metodo_pago,
        total,
        totalArticulos,
        data.estatus,
        data.observaciones,
      ],
    );

    const venta = ventaRes.rows[0];

    for (const item of itemsProcesados) {
      const descuentoLinea =
        subtotal > 0
          ? Number(((item.subtotal / subtotal) * descuento).toFixed(2))
          : 0;

      const descuentoUnitario =
        item.cantidad > 0
          ? Number((descuentoLinea / item.cantidad).toFixed(2))
          : 0;

      await client.query(
        `
        INSERT INTO ventas_detalle (
          id_venta,
          id_producto,
          cantidad,
          precio_unitario,
          descuento_unitario,
          subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          venta.id,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          descuentoUnitario,
          item.subtotal,
        ],
      );

      await client.query(
        `
        UPDATE inventario
        SET stock_actual = $1
        WHERE id_producto = $2
        `,
        [item.stock_nuevo, item.id_producto],
      );

      await client.query(
        `
        INSERT INTO movimientos_inventario (
          id_producto,
          tipo_movimiento,
          cantidad,
          stock_anterior,
          stock_nuevo,
          motivo,
          id_usuario,
          id_venta
        )
        VALUES ($1, 'salida', $2, $3, $4, $5, $6, $7)
        `,
        [
          item.id_producto,
          item.cantidad,
          item.stock_anterior,
          item.stock_nuevo,
          data.estatus === "pendiente"
            ? `Venta pendiente ${folio}`
            : `Venta finalizada ${folio}`,
          data.id_usuario,
          venta.id,
        ],
      );
    }

    await client.query("COMMIT");

    return await getById(venta.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateVentaPendiente(id, data) {
  throw new Error("Falta implementar updateVentaPendiente");
}

async function cancelarVenta(idVenta, idUsuario = 1) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Buscar venta
    const ventaRes = await client.query(
      `SELECT id, folio, estatus
       FROM ventas
       WHERE id = $1`,
      [idVenta],
    );

    if (ventaRes.rows.length === 0) {
      throw new Error("La venta no existe");
    }

    const venta = ventaRes.rows[0];

    if (venta.estatus === "cancelada") {
      throw new Error("La venta ya está cancelada");
    }

    // 2. Obtener detalle de productos de la venta
    const detalleRes = await client.query(
      `SELECT id_producto, cantidad
       FROM ventas_detalle
       WHERE id_venta = $1`,
      [idVenta],
    );

    if (detalleRes.rows.length === 0) {
      throw new Error("La venta no tiene productos en el detalle");
    }

    // 3. Regresar stock + registrar movimiento
    for (const item of detalleRes.rows) {
      // Obtener stock actual
      const inventarioRes = await client.query(
        `SELECT stock_actual
         FROM inventario
         WHERE id_producto = $1`,
        [item.id_producto],
      );

      if (inventarioRes.rows.length === 0) {
        throw new Error(
          `No existe inventario para el producto con id ${item.id_producto}`,
        );
      }

      const stockAnterior = Number(inventarioRes.rows[0].stock_actual);
      const cantidad = Number(item.cantidad);
      const stockNuevo = stockAnterior + cantidad;

      // Actualizar stock
      await client.query(
        `UPDATE inventario
         SET stock_actual = $1
         WHERE id_producto = $2`,
        [stockNuevo, item.id_producto],
      );

      // Insertar movimiento de inventario
      await client.query(
        `INSERT INTO movimientos_inventario
          (
            id_producto,
            tipo_movimiento,
            cantidad,
            stock_anterior,
            stock_nuevo,
            motivo,
            id_usuario,
            id_venta
          )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.id_producto,
          "entrada",
          cantidad,
          stockAnterior,
          stockNuevo,
          "cancelacion_venta",
          idUsuario,
          idVenta,
        ],
      );
    }

    // 4. Actualizar estatus de la venta
    await client.query(
      `UPDATE ventas
       SET estatus = 'cancelada'
       WHERE id = $1`,
      [idVenta],
    );

    await client.query("COMMIT");

    return {
      ok: true,
      message: "Venta cancelada y stock restablecido correctamente",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function finalizarVenta(id, data) {
  const res = await pool.query(
    `
    UPDATE ventas
    SET
      estatus = 'finalizada',
      metodo_pago = COALESCE($2, metodo_pago),
      observaciones = CASE
        WHEN $3 <> '' THEN $3
        ELSE observaciones
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND estatus = 'pendiente'
    RETURNING *
    `,
    [id, data.metodo_pago, data.observaciones],
  );

  if (res.rows.length === 0) {
    throw new Error("No se encontró una venta pendiente para finalizar");
  }

  return await getById(id);
}

module.exports = {
  getPendientes,
  getById,
  createVenta,
  updateVentaPendiente,
  cancelarVenta,
  finalizarVenta,
};
