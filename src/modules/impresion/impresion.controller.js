const impresionService = require("./impresion.service");

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
  getImpresoras,
};
