// cobros/cobros.controller.js
const cobrosService = require("./cobros.service");

async function obtenerTicketsPendientes(req, res) {
  try {
    const tickets = await cobrosService.getTicketsPendientes();

    return res.status(200).json({
      ok: true,
      total: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error en obtenerTicketsPendientes:", error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error al obtener tickets pendientes",
    });
  }
}

async function obtenerDetalleTicket(req, res) {
  try {
    const { id } = req.params;

    const ticket = await cobrosService.getDetalleTicketPendiente(id);

    return res.status(200).json({
      ok: true,
      ticket,
    });
  } catch (error) {
    console.error("Error en obtenerDetalleTicket:", error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error al obtener detalle del ticket",
    });
  }
}

async function cobrarTicket(req, res) {
  try {
    const { id } = req.params;

    const ticket = await cobrosService.procesarCobroTicket(id, req.body);

    return res.status(200).json({
      ok: true,
      message: "Ticket cobrado correctamente",
      ticket,
    });
  } catch (error) {
    console.error("Error en cobrarTicket:", error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error al cobrar ticket",
    });
  }
}

module.exports = {
  obtenerTicketsPendientes,
  obtenerDetalleTicket,
  cobrarTicket,
};
