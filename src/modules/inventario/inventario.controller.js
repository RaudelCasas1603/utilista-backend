const service = require("./inventario.service");

async function getInventario(req, res) {
  try {
    const data = await service.obtenerInventario();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function getInventarioById(req, res) {
  try {
    const { id } = req.params;
    const data = await service.obtenerInventarioPorId(id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener inventario por id:", error);

    if (error.message === "Registro de inventario no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function getInventarioByProductoId(req, res) {
  try {
    const { id_producto } = req.params;
    const data = await service.obtenerInventarioPorProductoId(id_producto);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener inventario por producto:", error);

    if (error.message === "Inventario del producto no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function createInventario(req, res) {
  try {
    const data = await service.crearInventario(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear inventario:", error);

    if (
      error.message === "id_producto es obligatorio" ||
      error.message === "Ese producto ya tiene inventario registrado"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function updateInventario(req, res) {
  try {
    const { id } = req.params;
    const data = await service.actualizarInventario(id, req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al actualizar inventario:", error);

    if (error.message === "Registro de inventario no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function deleteInventario(req, res) {
  try {
    const { id } = req.params;
    const data = await service.eliminarInventario(id);
    res.status(200).json({
      message: "Registro de inventario eliminado correctamente",
      inventario: data,
    });
  } catch (error) {
    console.error("Error al eliminar inventario:", error);

    if (error.message === "Registro de inventario no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function getProveedoresReporteInventario(req, res) {
  try {
    const data = await service.obtenerProveedoresReporteInventario();

    res.status(200).json({
      ok: true,
      proveedores: data,
    });
  } catch (error) {
    console.error("Error al obtener proveedores del reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
async function getReporteInventario(req, res) {
  try {
    const data = await service.obtenerReporteInventario(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al generar reporte de inventario:", error);

    if (error.message === "Tipo de reporte inválido") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = {
  getInventario,
  getInventarioById,
  getInventarioByProductoId,
  createInventario,
  updateInventario,
  deleteInventario,
  getProveedoresReporteInventario,
  getReporteInventario,
};
