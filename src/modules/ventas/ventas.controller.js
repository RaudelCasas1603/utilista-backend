const service = require("./ventas.service");

async function getVentasPendientes(req, res) {
  try {
    const data = await service.obtenerVentasPendientes();
    res.json(data);
  } catch (e) {
    console.error("Error al obtener ventas pendientes:", e);
    res.status(500).json({ message: e.message });
  }
}

async function getVentaById(req, res) {
  try {
    const data = await service.obtenerVentaPorId(req.params.id);
    res.json(data);
  } catch (e) {
    console.error("Error al obtener venta:", e);
    res.status(404).json({ message: e.message });
  }
}

async function createVenta(req, res) {
  try {
    const data = await service.crearVenta(req.body);
    res.status(201).json(data);
  } catch (e) {
    console.error("Error al crear venta:", e);
    res.status(400).json({ message: e.message });
  }
}

async function updateVenta(req, res) {
  try {
    const data = await service.actualizarVentaPendiente(
      req.params.id,
      req.body,
    );
    res.json(data);
  } catch (e) {
    console.error("Error al actualizar venta:", e);
    res.status(400).json({ message: e.message });
  }
}

async function cancelarVenta(req, res) {
  try {
    const data = await service.cancelarVenta(
      req.params.id,
      req.body.id_usuario,
    );
    res.json(data);
  } catch (e) {
    console.error("Error al cancelar venta:", e);
    res.status(400).json({ message: e.message });
  }
}

async function finalizarVenta(req, res) {
  try {
    const data = await service.finalizarVenta(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    console.error("Error al finalizar venta:", e);
    res.status(400).json({ message: e.message });
  }
}

module.exports = {
  getVentasPendientes,
  getVentaById,
  createVenta,
  updateVenta,
  cancelarVenta,
  finalizarVenta,
};
