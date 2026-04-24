const pool = require("../../config/db");

async function getAll() {
  const result = await pool.query(`
    SELECT
      cc.id,
      cc.fecha_corte,
      cc.hora_corte,
      cc.fecha_hora_corte,
      cc.id_usuario,
      cc.total_ventas,
      cc.total_tarjeta,
      cc.total_transferencias,
      cc.total_efectivo,
      cc.total_devoluciones,
      cc.total_tickets,
      cc.saldo_inicial,
      cc.efectivo_esperado,
      cc.efectivo_contado,
      cc.diferencia,
      cc.monto_sobrante,
      cc.monto_faltante,
      cc.tipo_resultado,
      cc.estado_corte,
      cc.observaciones,
      cc.created_at
    FROM cortes_caja cc
    ORDER BY cc.fecha_hora_corte DESC, cc.id DESC
  `);

  return result.rows;
}

async function getById(id) {
  const corteRes = await pool.query(
    `
    SELECT
      cc.id,
      cc.fecha_corte,
      cc.hora_corte,
      cc.fecha_hora_corte,
      cc.id_usuario,
      cc.total_ventas,
      cc.total_tarjeta,
      cc.total_transferencias,
      cc.total_efectivo,
      cc.total_devoluciones,
      cc.total_tickets,
      cc.saldo_inicial,
      cc.efectivo_esperado,
      cc.efectivo_contado,
      cc.diferencia,
      cc.monto_sobrante,
      cc.monto_faltante,
      cc.tipo_resultado,
      cc.estado_corte,
      cc.observaciones,
      cc.created_at
    FROM cortes_caja cc
    WHERE cc.id = $1
    `,
    [id],
  );

  const corte = corteRes.rows[0];

  if (!corte) return null;

  const detalleRes = await pool.query(
    `
    SELECT
      id,
      id_corte_caja,
      denominacion,
      cantidad,
      subtotal
    FROM cortes_caja_detalle
    WHERE id_corte_caja = $1
    ORDER BY denominacion DESC
    `,
    [id],
  );

  return {
    ...corte,
    detalle: detalleRes.rows,
  };
}

async function create(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      fecha_corte,
      hora_corte,
      id_usuario,
      total_ventas = 0,
      total_tarjeta = 0,
      total_transferencias = 0,
      total_efectivo = 0,
      total_devoluciones = 0,
      total_tickets = 0,
      saldo_inicial = 0,
      efectivo_esperado = 0,
      efectivo_contado = 0,
      observaciones = "",
      detalle = [],
    } = data;

    const diferencia = Number(efectivo_contado) - Number(efectivo_esperado);

    const monto_sobrante = diferencia > 0 ? diferencia : 0;
    const monto_faltante = diferencia < 0 ? Math.abs(diferencia) : 0;

    let tipo_resultado = "cuadrado";

    if (diferencia > 0) tipo_resultado = "sobrante";
    if (diferencia < 0) tipo_resultado = "faltante";

    const corteRes = await client.query(
      `
      INSERT INTO cortes_caja (
        fecha_corte,
        hora_corte,
        fecha_hora_corte,
        id_usuario,
        total_ventas,
        total_tarjeta,
        total_transferencias,
        total_efectivo,
        total_devoluciones,
        total_tickets,
        saldo_inicial,
        efectivo_esperado,
        efectivo_contado,
        diferencia,
        monto_sobrante,
        monto_faltante,
        tipo_resultado,
        estado_corte,
        observaciones
      )
      VALUES (
        COALESCE($1, CURRENT_DATE),
        COALESCE($2, CURRENT_TIME),
        CURRENT_TIMESTAMP,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16::tipo_resultado,
        'cerrado'::estado_corte,
        $17
      )
      RETURNING *
      `,
      [
        fecha_corte || null,
        hora_corte || null,
        id_usuario,
        total_ventas,
        total_tarjeta,
        total_transferencias,
        total_efectivo,
        total_devoluciones,
        total_tickets,
        saldo_inicial,
        efectivo_esperado,
        efectivo_contado,
        diferencia,
        monto_sobrante,
        monto_faltante,
        tipo_resultado,
        observaciones,
      ],
    );

    const corte = corteRes.rows[0];

    for (const item of detalle) {
      const denominacion = Number(item.denominacion || 0);
      const cantidad = Number(item.cantidad || 0);
      const subtotal = Number(item.subtotal || denominacion * cantidad);

      await client.query(
        `
        INSERT INTO cortes_caja_detalle (
          id_corte_caja,
          denominacion,
          cantidad,
          subtotal
        )
        VALUES ($1, $2, $3, $4)
        `,
        [corte.id, denominacion, cantidad, subtotal],
      );
    }

    await client.query("COMMIT");

    return getById(corte.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getResumenDia(fecha) {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(v.total), 0) AS total_ventas,

      COALESCE(SUM(
        CASE 
          WHEN v.metodo_pago = 'efectivo' THEN v.total 
          ELSE 0 
        END
      ), 0) AS pagos_efectivo,

      COALESCE(SUM(
        CASE 
          WHEN v.metodo_pago = 'tarjeta' THEN v.total 
          ELSE 0 
        END
      ), 0) AS cobros_tarjeta_con_comision,

      COALESCE(SUM(
        CASE 
          WHEN v.metodo_pago = 'transferencia' THEN v.total 
          ELSE 0 
        END
      ), 0) AS transferencias,

      COUNT(v.id) AS tickets,

      COALESCE((
        SELECT SUM(d.total)
        FROM devoluciones d
        WHERE DATE(d.fecha_hora) = $1
          AND d.estatus = 'finalizada'
      ), 0) AS devoluciones

    FROM ventas v
    WHERE DATE(v.fecha_hora) = $1
      AND v.estatus = 'finalizada'
    `,
    [fecha],
  );

  return result.rows[0];
}
module.exports = {
  getAll,
  getById,
  create,
  getResumenDia,
};
