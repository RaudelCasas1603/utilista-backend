const dashboardRepository = require("./dashboard.repository");

function getDescripcionVentas(periodo) {
  if (periodo === "dia") return "VENTAS POR DÍA";
  if (periodo === "semana") return "VENTAS POR SEMANA";
  return "VENTAS POR MES";
}

function getDescripcionMargen(periodo) {
  if (periodo === "dia") return "MARGEN DE GANANCIA POR DÍA";
  if (periodo === "semana") return "MARGEN DE GANANCIA POR SEMANA";
  return "MARGEN DE GANANCIA POR MES";
}

async function getResumenDashboard(periodo = "dia", fecha) {
  const resumen = await dashboardRepository.getResumenDashboard(periodo, fecha);

  return {
    periodo,
    fechaReferencia: fecha || new Date().toISOString().slice(0, 10),
    rango: resumen.rango,
    resumen: {
      ventas: Number(resumen.ventas_netas || 0),

      ventasBrutas: Number(resumen.ventas_brutas || 0),
      ventasNetas: Number(resumen.ventas_netas || 0),
      utilidadRealCaja: Number(resumen.utilidad_real_caja || 0),

      efectivo: Number(resumen.ventas_efectivo || 0),
      tarjeta: Number(resumen.ventas_tarjeta || 0),
      transferencias: Number(resumen.ventas_transferencia || 0),

      comisionTarjeta: Number(resumen.comision_tarjeta || 0),
      devoluciones: Number(resumen.devoluciones || 0),

      tickets: Number(resumen.tickets || 0),
      ticketPromedio: Number(resumen.ticket_promedio || 0),
      stockBajo: Number(resumen.stock_bajo || 0),
    },
  };
}

async function getGraficaVentas(periodo = "dia", fecha) {
  const data = await dashboardRepository.getGraficaVentas(periodo, fecha);

  return {
    periodo,
    descripcion: getDescripcionVentas(periodo),
    data: data.map((item) => ({
      label: item.label,
      ventas: Number(item.ventas || 0),
    })),
  };
}

async function getGraficaMargen(periodo = "dia", fecha) {
  const data = await dashboardRepository.getGraficaMargen(periodo, fecha);

  return {
    periodo,
    descripcion: getDescripcionMargen(periodo),
    data: data.map((item) => ({
      label: item.label,
      margen: Number(item.margen || 0),
    })),
  };
}

async function getVentasPorCategoria(periodo = "dia", fecha) {
  const data = await dashboardRepository.getVentasPorCategoria(periodo, fecha);

  return {
    periodo,
    descripcion: "PORCENTAJE DE VENTA POR CATEGORÍA",
    data: data.map((item) => ({
      name: item.name,
      value: Number(item.value || 0),
    })),
  };
}

module.exports = {
  getResumenDashboard,
  getGraficaVentas,
  getGraficaMargen,
  getVentasPorCategoria,
};
