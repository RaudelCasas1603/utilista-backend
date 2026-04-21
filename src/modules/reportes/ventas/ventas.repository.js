const pool = require("../../../config/db");

async function getReporteResumen(fechaInicio, fechaFin) {
  const resumenRes = await pool.query(
    `
    SELECT
      COALESCE(SUM(v.total), 0) AS total_vendido,
      COALESCE(SUM(v.total_articulos), 0) AS total_productos,
      COUNT(*) AS total_tickets,
      COUNT(DISTINCT v.fecha_hora::date) AS dias_con_venta,
      COUNT(DISTINCT v.id_cliente) AS clientes_atendidos
    FROM ventas v
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora::date BETWEEN $1::date AND $2::date
    `,
    [fechaInicio, fechaFin],
  );

  const margenRes = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(
          ((vd.precio_unitario - COALESCE(p.precio_compra, 0)) * vd.cantidad)
          - (vd.descuento_unitario * vd.cantidad)
        ),
        0
      ) AS total_margen
    FROM ventas_detalle vd
    INNER JOIN ventas v ON v.id = vd.id_venta
    INNER JOIN productos p ON p.id = vd.id_producto
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora::date BETWEEN $1::date AND $2::date
    `,
    [fechaInicio, fechaFin],
  );

  const resumen = resumenRes.rows[0];
  const margen = margenRes.rows[0];

  const totalVendido = Number(resumen.total_vendido || 0);
  const totalMargen = Number(margen.total_margen || 0);
  const totalTickets = Number(resumen.total_tickets || 0);
  const totalProductos = Number(resumen.total_productos || 0);
  const diasConVenta = Number(resumen.dias_con_venta || 0);
  const clientesAtendidos = Number(resumen.clientes_atendidos || 0);

  return {
    totalVendido,
    totalMargen,
    totalTickets,
    totalProductos,
    clientesAtendidos,
    ticketPromedio: totalTickets > 0 ? totalVendido / totalTickets : 0,
    margenPromedio: totalVendido > 0 ? (totalMargen / totalVendido) * 100 : 0,
    diasConVenta,
    promedioProductosPorTicket:
      totalTickets > 0 ? totalProductos / totalTickets : 0,
  };
}

async function getReportePorDia(fechaInicio, fechaFin) {
  const res = await pool.query(
    `
    WITH ventas_dia AS (
      SELECT
        v.fecha_hora::date AS fecha_real,
        COALESCE(SUM(v.total), 0) AS ventas,
        COUNT(*) AS tickets,
        COALESCE(SUM(v.total_articulos), 0) AS productos
      FROM ventas v
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora::date BETWEEN $1::date AND $2::date
      GROUP BY v.fecha_hora::date
    ),
    margen_dia AS (
      SELECT
        v.fecha_hora::date AS fecha_real,
        COALESCE(
          SUM(
            ((vd.precio_unitario - COALESCE(p.precio_compra, 0)) * vd.cantidad)
            - (vd.descuento_unitario * vd.cantidad)
          ),
          0
        ) AS margen
      FROM ventas_detalle vd
      INNER JOIN ventas v ON v.id = vd.id_venta
      INNER JOIN productos p ON p.id = vd.id_producto
      WHERE v.estatus = 'finalizada'
        AND v.fecha_hora::date BETWEEN $1::date AND $2::date
      GROUP BY v.fecha_hora::date
    )
    SELECT
      TO_CHAR(vd.fecha_real, 'DD Mon') AS fecha,
      vd.fecha_real,
      vd.ventas,
      COALESCE(md.margen, 0) AS margen,
      vd.tickets,
      vd.productos
    FROM ventas_dia vd
    LEFT JOIN margen_dia md ON md.fecha_real = vd.fecha_real
    ORDER BY vd.fecha_real ASC
    `,
    [fechaInicio, fechaFin],
  );

  return res.rows.map((row) => ({
    fecha: row.fecha,
    fechaReal: row.fecha_real,
    ventas: Number(row.ventas || 0),
    margen: Number(row.margen || 0),
    tickets: Number(row.tickets || 0),
    productos: Number(row.productos || 0),
  }));
}

async function getReporteMetodosPago(fechaInicio, fechaFin) {
  const res = await pool.query(
    `
    SELECT
      COALESCE(v.metodo_pago::text, 'sin_metodo') AS metodo_pago,
      COALESCE(SUM(v.total), 0) AS total
    FROM ventas v
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora::date BETWEEN $1::date AND $2::date
    GROUP BY v.metodo_pago
    ORDER BY total DESC
    `,
    [fechaInicio, fechaFin],
  );

  const totalGeneral = res.rows.reduce(
    (acc, row) => acc + Number(row.total || 0),
    0,
  );

  return res.rows.map((row) => {
    const total = Number(row.total || 0);
    const porcentaje =
      totalGeneral > 0 ? Number(((total / totalGeneral) * 100).toFixed(2)) : 0;

    let nombre = "Sin método";

    if (row.metodo_pago === "efectivo") nombre = "Efectivo";
    if (row.metodo_pago === "tarjeta") nombre = "Tarjeta";
    if (row.metodo_pago === "transferencia") nombre = "Transferencia";

    return {
      nombre,
      total,
      porcentaje,
    };
  });
}

async function getReporteTopProductos(fechaInicio, fechaFin, limit = 5) {
  const res = await pool.query(
    `
    SELECT
      p.id,
      p.nombre,
      COALESCE(SUM(vd.cantidad), 0) AS cantidad,
      COALESCE(
        SUM(vd.subtotal - (vd.descuento_unitario * vd.cantidad)),
        0
      ) AS ingreso,
      COALESCE(
        SUM(
          ((vd.precio_unitario - COALESCE(p.precio_compra, 0)) * vd.cantidad)
          - (vd.descuento_unitario * vd.cantidad)
        ),
        0
      ) AS margen
    FROM ventas_detalle vd
    INNER JOIN ventas v ON v.id = vd.id_venta
    INNER JOIN productos p ON p.id = vd.id_producto
    WHERE v.estatus = 'finalizada'
      AND v.fecha_hora::date BETWEEN $1::date AND $2::date
    GROUP BY p.id, p.nombre
    ORDER BY cantidad DESC, ingreso DESC
    LIMIT $3
    `,
    [fechaInicio, fechaFin, limit],
  );

  return res.rows.map((row) => ({
    id: Number(row.id),
    nombre: row.nombre,
    cantidad: Number(row.cantidad || 0),
    ingreso: Number(row.ingreso || 0),
    margen: Number(row.margen || 0),
  }));
}

module.exports = {
  getReporteResumen,
  getReportePorDia,
  getReporteMetodosPago,
  getReporteTopProductos,
};
