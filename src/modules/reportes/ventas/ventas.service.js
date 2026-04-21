const repo = require("./ventas.repository");

function formatearFechaLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerRangoFechas(periodo, fechaInicio, fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicio = new Date(hoy);
  const fin = new Date(hoy);

  switch (periodo) {
    case "hoy":
      break;

    case "ayer":
      inicio.setDate(inicio.getDate() - 1);
      fin.setDate(fin.getDate() - 1);
      break;

    case "ultimos_7_dias":
      inicio.setDate(inicio.getDate() - 6);
      break;

    case "ultimos_30_dias":
      inicio.setDate(inicio.getDate() - 29);
      break;

    case "este_mes":
      inicio.setDate(1);
      break;

    case "mes_pasado":
      inicio.setMonth(inicio.getMonth() - 1, 1);
      fin.setDate(0);
      break;

    case "ultimos_7_meses":
      inicio.setMonth(inicio.getMonth() - 6, 1);
      break;

    case "personalizado":
      if (!fechaInicio || !fechaFin) {
        throw new Error(
          "Para periodo=personalizado debes enviar fechaInicio y fechaFin",
        );
      }
      return {
        fechaInicio,
        fechaFin,
      };

    default:
      inicio.setDate(inicio.getDate() - 6);
      break;
  }

  return {
    fechaInicio: formatearFechaLocal(inicio),
    fechaFin: formatearFechaLocal(fin),
  };
}

function validarLimit(limit) {
  const parsed = Number(limit || 5);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 5;
  }
  return parsed;
}

async function obtenerReporteResumen(query) {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(
    query.periodo,
    query.fechaInicio,
    query.fechaFin,
  );

  return await repo.getReporteResumen(fechaInicio, fechaFin);
}

async function obtenerReportePorDia(query) {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(
    query.periodo,
    query.fechaInicio,
    query.fechaFin,
  );

  return await repo.getReportePorDia(fechaInicio, fechaFin);
}

async function obtenerReporteMetodosPago(query) {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(
    query.periodo,
    query.fechaInicio,
    query.fechaFin,
  );

  return await repo.getReporteMetodosPago(fechaInicio, fechaFin);
}

async function obtenerReporteTopProductos(query) {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(
    query.periodo,
    query.fechaInicio,
    query.fechaFin,
  );

  const limit = validarLimit(query.limit);

  return await repo.getReporteTopProductos(fechaInicio, fechaFin, limit);
}

async function obtenerReporteCompleto(query) {
  const { fechaInicio, fechaFin } = obtenerRangoFechas(
    query.periodo,
    query.fechaInicio,
    query.fechaFin,
  );

  const limit = validarLimit(query.limit);

  const [resumen, porDia, metodosPago, topProductos] = await Promise.all([
    repo.getReporteResumen(fechaInicio, fechaFin),
    repo.getReportePorDia(fechaInicio, fechaFin),
    repo.getReporteMetodosPago(fechaInicio, fechaFin),
    repo.getReporteTopProductos(fechaInicio, fechaFin, limit),
  ]);

  const mejorDia =
    porDia.length > 0
      ? [...porDia].sort((a, b) => b.ventas - a.ventas)[0]
      : null;

  return {
    filtros: {
      periodo: query.periodo || "ultimos_7_dias",
      fechaInicio,
      fechaFin,
      limit,
    },
    resumen,
    mejorDia,
    ventasPorDia: porDia,
    metodosPago,
    topProductos,
    resumenDias: porDia.map((item) => ({
      fecha: item.fecha,
      tickets: item.tickets,
      vendidos: item.ventas,
      margen: item.margen,
      productos: item.productos,
    })),
  };
}

module.exports = {
  obtenerReporteResumen,
  obtenerReportePorDia,
  obtenerReporteMetodosPago,
  obtenerReporteTopProductos,
  obtenerReporteCompleto,
};
