const corteCajaService = require("./corte-caja.service");

async function getAllCortesCaja(req, res) {
  try {
    const cortes = await corteCajaService.getAllCortesCaja();

    res.json(cortes);
  } catch (error) {
    console.error("Error al listar cortes de caja:", error);

    res.status(500).json({
      message: "Error al listar cortes de caja",
      error: error.message,
    });
  }
}

async function getCorteCajaById(req, res) {
  try {
    const { id } = req.params;

    const corte = await corteCajaService.getCorteCajaById(id);

    if (!corte) {
      return res.status(404).json({
        message: "Corte de caja no encontrado",
      });
    }

    res.json(corte);
  } catch (error) {
    console.error("Error al obtener corte de caja:", error);

    res.status(500).json({
      message: "Error al obtener corte de caja",
      error: error.message,
    });
  }
}

async function createCorteCaja(req, res) {
  try {
    const result = await corteCajaService.createCorteCaja(req.body);

    res.status(201).json({
      message: "Corte de caja creado correctamente",
      ...result,
    });
  } catch (error) {
    console.error("Error al crear corte de caja:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Error al crear corte de caja",
    });
  }
}

async function getResumenDia(req, res) {
  try {
    const fecha = req.query.fecha || getFechaMexico();

    console.log("Fecha recibida:", fecha);

    const resumen = await corteCajaService.getResumenDia(fecha);

    res.json({
      totalVentas: Number(resumen.total_ventas),
      cobrosTarjetaConComision: Number(resumen.cobros_tarjeta_con_comision),
      transferencias: Number(resumen.transferencias),
      pagosEfectivo: Number(resumen.pagos_efectivo),
      devoluciones: Number(resumen.devoluciones),
      tickets: Number(resumen.tickets),
    });
  } catch (error) {
    console.error("Error al obtener resumen del día:", error);
    res.status(500).json({
      message: "Error al obtener resumen del día",
    });
  }
}

function getFechaMexico() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

module.exports = {
  getAllCortesCaja,
  getCorteCajaById,
  createCorteCaja,
  getResumenDia,
};
