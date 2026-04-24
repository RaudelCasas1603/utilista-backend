const impresionService = require("./impresion.service");
const corteCajaRepository = require("../corte-caja/corte-caja.repository");

async function imprimirTicketVenta(req, res) {
  try {
    const { idVenta } = req.params;

    const resultado = await impresionService.imprimirTicketVenta(
      Number(idVenta),
    );

    res.status(200).json({
      ok: true,
      message: "Ticket enviado a impresión",
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al imprimir ticket:", error);

    res.status(500).json({
      ok: false,
      message: error.message || "No se pudo imprimir el ticket",
    });
  }
}

async function imprimirCorteCaja(req, res) {
  try {
    const { idCorteCaja } = req.params;

    const corte = await corteCajaRepository.getById(Number(idCorteCaja));

    if (!corte) {
      return res.status(404).json({
        ok: false,
        message: "Corte de caja no encontrado",
      });
    }

    const resultado = await impresionService.imprimirCorteCaja(corte);

    res.status(200).json({
      ok: true,
      message: "Corte de caja enviado a impresión",
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al imprimir corte:", error);

    res.status(500).json({
      ok: false,
      message: error.message || "No se pudo imprimir el corte",
    });
  }
}

async function getImpresoras(req, res) {
  try {
    const impresoras = await impresionService.listarImpresoras();

    res.json(impresoras);
  } catch (error) {
    console.error("Error al listar impresoras:", error);

    res.status(500).json({
      message: "Error al obtener impresoras",
    });
  }
}

module.exports = {
  imprimirTicketVenta,
  imprimirCorteCaja, // 🔥 IMPORTANTE
  getImpresoras,
};
