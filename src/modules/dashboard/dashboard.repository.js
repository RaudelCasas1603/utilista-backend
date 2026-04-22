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
    SELECT
      COALESCE(SUM(v.total), 0) AS ventas,
      COUNT(v.id) AS tickets,
      COALESCE(AVG(v.total), 0) AS ticket_promedio,
      (
        SELECT COUNT(i.id)
        FROM inventario i
        WHERE i.stock_actual <= i.stock_minimo
      ) AS stock_bajo
    FROM ventas v
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora BETWEEN $1 AND $2
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
