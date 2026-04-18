const service = require("./configuracion.service");

async function getConfiguracion(req, res) {
  try {
    const data = await service.obtenerConfiguracion();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function updateConfiguracion(req, res) {
  try {
    const data = await service.actualizarConfiguracion(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getConfiguracion,
  updateConfiguracion,
};
