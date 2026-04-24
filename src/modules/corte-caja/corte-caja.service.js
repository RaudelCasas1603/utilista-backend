const corteCajaRepository = require("./corte-caja.repository");
const impresionService = require("../impresion/impresion.service");

async function getAllCortesCaja() {
  return await corteCajaRepository.getAll();
}

async function getCorteCajaById(id) {
  return await corteCajaRepository.getById(id);
}

async function createCorteCaja(data) {
  if (!data.id_usuario) {
    const error = new Error("El id_usuario es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  const corte = await corteCajaRepository.create(data);

  let impresion = {
    ok: false,
    message: "No se solicitó impresión",
  };

  if (data.imprimir === true) {
    try {
      impresion = await impresionService.imprimirCorteCaja(corte);
    } catch (error) {
      console.error("Error al imprimir corte de caja:", error);

      impresion = {
        ok: false,
        message: "El corte se creó, pero no se pudo imprimir",
        error: error.message,
      };
    }
  }

  return {
    corte,
    impresion,
  };
}

async function getResumenDia(fecha) {
  return await corteCajaRepository.getResumenDia(fecha);
}

module.exports = {
  getAllCortesCaja,
  getCorteCajaById,
  createCorteCaja,
  getResumenDia,
};
