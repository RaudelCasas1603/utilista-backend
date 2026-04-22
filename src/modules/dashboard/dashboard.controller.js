const dashboardService = require("./dashboard.service");

async function getResumenDashboard(req, res) {
  try {
    const { periodo = "dia", fecha } = req.query;
    const data = await dashboardService.getResumenDashboard({ periodo, fecha });
    res.json(data);
  } catch (error) {
    console.error("Error en getResumenDashboard:", error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard" });
  }
}

async function getGraficaVentas(req, res) {
  try {
    const { periodo = "dia", fecha } = req.query;
    const data = await dashboardService.getGraficaVentas({ periodo, fecha });
    res.json(data);
  } catch (error) {
    console.error("Error en getGraficaVentas:", error);
    res.status(500).json({ message: "Error al obtener gráfica de ventas" });
  }
}

async function getGraficaMargen(req, res) {
  try {
    const { periodo = "dia", fecha } = req.query;
    const data = await dashboardService.getGraficaMargen({ periodo, fecha });
    res.json(data);
  } catch (error) {
    console.error("Error en getGraficaMargen:", error);
    res.status(500).json({ message: "Error al obtener gráfica de margen" });
  }
}

async function getVentasPorCategoria(req, res) {
  try {
    const { periodo = "dia", fecha } = req.query;
    const data = await dashboardService.getVentasPorCategoria({
      periodo,
      fecha,
    });
    res.json(data);
  } catch (error) {
    console.error("Error en getVentasPorCategoria:", error);
    res.status(500).json({ message: "Error al obtener ventas por categoría" });
  }
}

module.exports = {
  getResumenDashboard,
  getGraficaVentas,
  getGraficaMargen,
  getVentasPorCategoria,
};
