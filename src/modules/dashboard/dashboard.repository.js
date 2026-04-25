const pool = require("../../config/db");

function getRango(periodo, fecha = null) {
  const fechaBase = fecha ? new Date(`${fecha}T00:00:00`) : new Date();

  let inicio;
  let fin;

  if (periodo === "dia") {
    inicio = new Date(fechaBase);
    inicio.setHours(0, 0, 0, 0);

    fin = new Date(fechaBase);
    fin.setHours(23, 59, 59, 999);
  } else if (periodo === "semana") {
    inicio = new Date(fechaBase);
    const dia = inicio.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    inicio.setDate(inicio.getDate() + diff);
    inicio.setHours(0, 0, 0, 0);

    fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
  } else {
    inicio = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1);
    inicio.setHours(0, 0, 0, 0);

    fin = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 0);
    fin.setHours(23, 59, 59, 999);
  }

  return { inicio, fin };
}

async function getResumenDashboard(periodo, fecha) {
  const { inicio, fin } = getRango(periodo, fecha);

  const query = `
    WITH config AS (
      SELECT COALESCE(comision_terminal, 0) AS comision_terminal
      FROM configuracion_sistema
      ORDER BY id ASC
      LIMIT 1
    ),
    ventas_resumen AS (
      SELECT
        COALESCE(SUM(v.total), 0) AS ventas_brutas,

        COALESCE(SUM(
          CASE WHEN v.metodo_pago = 'efectivo' THEN v.total ELSE 0 END
        ), 0) AS ventas_efectivo,

        COALESCE(SUM(
          CASE WHEN v.metodo_pago = 'transferencia' THEN v.total ELSE 0 END
        ), 0) AS ventas_transferencia,

        COALESCE(SUM(
          CASE WHEN v.metodo_pago = 'tarjeta' THEN v.total ELSE 0 END
        ), 0) AS ventas_tarjeta,

        COALESCE(SUM(
          CASE 
            WHEN v.metodo_pago = 'tarjeta' 
            THEN v.total * (config.comision_terminal / 100)
            ELSE 0 
          END
        ), 0) AS comision_tarjeta,

        COUNT(v.id) AS tickets,
        COALESCE(AVG(v.total), 0) AS ticket_promedio
      FROM ventas v
      CROSS JOIN config
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
    ),
    devoluciones_resumen AS (
      SELECT
        COALESCE(SUM(d.total), 0) AS devoluciones
      FROM devoluciones d
      WHERE d.estatus = 'finalizada'
        AND d.fecha_hora BETWEEN $1 AND $2
    ),
    stock_resumen AS (
      SELECT COUNT(i.id) AS stock_bajo
      FROM inventario i
      WHERE i.stock_actual <= i.stock_minimo
    )
    SELECT
      vr.ventas_brutas,
      vr.ventas_efectivo,
      vr.ventas_transferencia,
      vr.ventas_tarjeta,
      vr.comision_tarjeta,
      dr.devoluciones,

      (vr.ventas_brutas - dr.devoluciones) AS ventas_netas,

      (
        vr.ventas_brutas
        - dr.devoluciones
        - vr.comision_tarjeta
      ) AS utilidad_real_caja,

      vr.tickets,
      vr.ticket_promedio,
      sr.stock_bajo
    FROM ventas_resumen vr
    CROSS JOIN devoluciones_resumen dr
    CROSS JOIN stock_resumen sr
  `;

  const result = await pool.query(query, [inicio, fin]);

  return {
    ...result.rows[0],
    rango: { inicio, fin },
  };
}

async function getGraficaVentas(periodo, fecha) {
  const { inicio, fin } = getRango(periodo, fecha);

  let query = "";

  if (periodo === "dia") {
    query = `
      SELECT
        TO_CHAR(DATE_TRUNC('hour', v.fecha_hora), 'HH24:00') AS label,
        COALESCE(SUM(v.total), 0) AS ventas
      FROM ventas v
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('hour', v.fecha_hora)
      ORDER BY DATE_TRUNC('hour', v.fecha_hora)
    `;
  } else if (periodo === "semana") {
    query = `
      SELECT
        CASE EXTRACT(ISODOW FROM v.fecha_hora)
          WHEN 1 THEN 'Lun'
          WHEN 2 THEN 'Mar'
          WHEN 3 THEN 'Mié'
          WHEN 4 THEN 'Jue'
          WHEN 5 THEN 'Vie'
          WHEN 6 THEN 'Sáb'
          WHEN 7 THEN 'Dom'
        END AS label,
        COALESCE(SUM(v.total), 0) AS ventas,
        EXTRACT(ISODOW FROM v.fecha_hora) AS orden
      FROM ventas v
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY EXTRACT(ISODOW FROM v.fecha_hora)
      ORDER BY orden
    `;
  } else {
    query = `
      SELECT
        TO_CHAR(v.fecha_hora, 'DD') AS label,
        COALESCE(SUM(v.total), 0) AS ventas
      FROM ventas v
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY TO_CHAR(v.fecha_hora, 'DD'), DATE(v.fecha_hora)
      ORDER BY DATE(v.fecha_hora)
    `;
  }

  const result = await pool.query(query, [inicio, fin]);
  return result.rows;
}

async function getGraficaMargen(periodo, fecha) {
  const { inicio, fin } = getRango(periodo, fecha);

  let query = "";

  if (periodo === "dia") {
    query = `
      SELECT
        TO_CHAR(DATE_TRUNC('hour', v.fecha_hora), 'HH24:00') AS label,
        COALESCE(SUM(((vd.precio_unitario - p.precio_compra) - vd.descuento_unitario) * vd.cantidad), 0) AS margen
      FROM ventas v
      INNER JOIN ventas_detalle vd ON vd.id_venta = v.id
      INNER JOIN productos p ON p.id = vd.id_producto
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('hour', v.fecha_hora)
      ORDER BY DATE_TRUNC('hour', v.fecha_hora)
    `;
  } else if (periodo === "semana") {
    query = `
      SELECT
        CASE EXTRACT(ISODOW FROM v.fecha_hora)
          WHEN 1 THEN 'Lun'
          WHEN 2 THEN 'Mar'
          WHEN 3 THEN 'Mié'
          WHEN 4 THEN 'Jue'
          WHEN 5 THEN 'Vie'
          WHEN 6 THEN 'Sáb'
          WHEN 7 THEN 'Dom'
        END AS label,
        COALESCE(SUM(((vd.precio_unitario - p.precio_compra) - vd.descuento_unitario) * vd.cantidad), 0) AS margen,
        EXTRACT(ISODOW FROM v.fecha_hora) AS orden
      FROM ventas v
      INNER JOIN ventas_detalle vd ON vd.id_venta = v.id
      INNER JOIN productos p ON p.id = vd.id_producto
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY EXTRACT(ISODOW FROM v.fecha_hora)
      ORDER BY orden
    `;
  } else {
    query = `
      SELECT
        TO_CHAR(v.fecha_hora, 'DD') AS label,
        COALESCE(SUM(((vd.precio_unitario - p.precio_compra) - vd.descuento_unitario) * vd.cantidad), 0) AS margen
      FROM ventas v
      INNER JOIN ventas_detalle vd ON vd.id_venta = v.id
      INNER JOIN productos p ON p.id = vd.id_producto
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora BETWEEN $1 AND $2
      GROUP BY TO_CHAR(v.fecha_hora, 'DD'), DATE(v.fecha_hora)
      ORDER BY DATE(v.fecha_hora)
    `;
  }

  const result = await pool.query(query, [inicio, fin]);
  return result.rows;
}

async function getVentasPorCategoria(periodo, fecha) {
  const { inicio, fin } = getRango(periodo, fecha);

  const query = `
    SELECT
      c.nombre AS name,
      ROUND(
        (
          SUM(vd.subtotal) * 100.0 /
          NULLIF(SUM(SUM(vd.subtotal)) OVER (), 0)
        )::numeric,
        2
      ) AS value
    FROM ventas v
    INNER JOIN ventas_detalle vd ON vd.id_venta = v.id
    INNER JOIN productos p ON p.id = vd.id_producto
    INNER JOIN categorias c ON c.id = p.id_categoria
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora BETWEEN $1 AND $2
    GROUP BY c.nombre
    ORDER BY value DESC
  `;

  const result = await pool.query(query, [inicio, fin]);
  return result.rows;
}

module.exports = {
  getResumenDashboard,
  getGraficaVentas,
  getGraficaMargen,
  getVentasPorCategoria,
};
