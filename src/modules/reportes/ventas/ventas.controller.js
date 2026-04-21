const service = require("./ventas.service");

async function getReporteVentasResumen(req, res) {
  try {
    const data = await service.obtenerReporteResumen(req.query);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener resumen de ventas:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getReporteVentasPorDia(req, res) {
  try {
    const data = await service.obtenerReportePorDia(req.query);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener ventas por día:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getReporteVentasMetodosPago(req, res) {
  try {
    const data = await service.obtenerReporteMetodosPago(req.query);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getReporteVentasTopProductos(req, res) {
  try {
    const data = await service.obtenerReporteTopProductos(req.query);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener top productos:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getReporteVentasCompleto(req, res) {
  try {
    const data = await service.obtenerReporteCompleto(req.query);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener reporte completo:", error);
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getReporteVentasResumen,
  getReporteVentasPorDia,
  getReporteVentasMetodosPago,
  getReporteVentasTopProductos,
  getReporteVentasCompleto,
};
