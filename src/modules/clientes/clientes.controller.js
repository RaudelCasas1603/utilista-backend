const service = require("./clientes.service");

async function getClientes(req, res) {
  try {
    const data = await service.obtenerClientes();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function getClienteById(req, res) {
  try {
    const { id } = req.params;
    const data = await service.obtenerClientePorId(id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener cliente:", error);

    if (error.message === "Cliente no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function createCliente(req, res) {
  try {
    const data = await service.crearCliente(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear cliente:", error);

    if (
      error.message === "El nombre es obligatorio" ||
      error.message === "El descuento no puede ser negativo"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function updateCliente(req, res) {
  try {
    const { id } = req.params;
    const data = await service.actualizarCliente(id, req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);

    if (
      error.message === "Cliente no encontrado" ||
      error.message === "El descuento no puede ser negativo"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function deleteCliente(req, res) {
  try {
    const { id } = req.params;
    const data = await service.eliminarCliente(id);
    res.status(200).json({
      message: "Cliente eliminado correctamente",
      cliente: data,
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);

    if (error.message === "Cliente no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function updateEstatus(req, res) {
  try {
    const { id } = req.params;
    const { estatus } = req.body;
    const data = await service.cambiarEstatus(id, estatus);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al cambiar estatus del cliente:", error);

    if (error.message === "Cliente no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function getUltimasVentasCliente(req, res) {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 8;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "El id del cliente no es válido.",
      });
    }

    const ventas = await service.obtenerUltimasVentasCliente(Number(id), limit);

    return res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener las últimas ventas del cliente:", error);
    return res.status(500).json({
      message: "Error interno al obtener las ventas del cliente.",
    });
  }
}

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  updateEstatus,
  getUltimasVentasCliente,
};
