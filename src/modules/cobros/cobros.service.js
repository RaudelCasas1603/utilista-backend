// cobros/cobros.service.js
const cobrosRepository = require("./cobros.repository");

async function getTicketsPendientes() {
  const tickets = await cobrosRepository.obtenerTicketsPendientes();

  return tickets.map((ticket) => ({
    ...ticket,
    productos_preview: ticket.productos_preview || [],
  }));
}

async function getDetalleTicketPendiente(id) {
  const ticket = await cobrosRepository.obtenerTicketPendientePorId(id);

  if (!ticket) {
    const error = new Error("Ticket pendiente no encontrado");
    error.status = 404;
    throw error;
  }

  const detalle = await cobrosRepository.obtenerDetalleCompletoTicket(id);

  return {
    ...ticket,
    productos: detalle,
  };
}

async function procesarCobroTicket(id, data) {
  const { metodo_pago, observaciones } = data;

  const metodosValidos = ["efectivo", "tarjeta", "transferencia"];

  if (!metodo_pago || !metodosValidos.includes(metodo_pago)) {
    const error = new Error("Método de pago inválido");
    error.status = 400;
    throw error;
  }

  const ticket = await cobrosRepository.obtenerTicketPendientePorId(id);

  if (!ticket) {
    const error = new Error("Ticket pendiente no encontrado");
    error.status = 404;
    throw error;
  }

  const ticketCobrado = await cobrosRepository.cobrarTicket(
    id,
    metodo_pago,
    observaciones || null,
  );

  if (!ticketCobrado) {
    const error = new Error("No fue posible cobrar el ticket");
    error.status = 400;
    throw error;
  }

  return ticketCobrado;
}

module.exports = {
  getTicketsPendientes,
  getDetalleTicketPendiente,
  procesarCobroTicket,
};
