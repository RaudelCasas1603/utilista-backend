const service = require("./proveedores.service");

async function getProveedores(req, res) {
  try {
    const data = await service.obtenerProveedores();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function getProveedorById(req, res) {
  try {
    const data = await service.obtenerProveedorPorId(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
}

async function createProveedor(req, res) {
  try {
    const data = await service.crearProveedor(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function updateProveedor(req, res) {
  try {
    const data = await service.actualizarProveedor(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function deleteProveedor(req, res) {
  try {
    const data = await service.eliminarProveedor(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function updateEstatus(req, res) {
  try {
    const { estatus } = req.body;
    const data = await service.cambiarEstatus(req.params.id, estatus);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function getStatsByProveedor(req, res) {
  try {
    const { id } = req.params;
    const stats = await service.getStatsByProveedor(id);
    res.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas del proveedor:", error);
    res.status(500).json({
      message:
        error.message ||
        "No se pudieron obtener las estadísticas del proveedor",
    });
  }
}

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  updateEstatus,
  getStatsByProveedor,
};
