const configuracionService = require("./configuracion.service");

async function getConfiguracion(req, res) {
  try {
    const configuracion = await configuracionService.obtenerConfiguracion();

    if (!configuracion) {
      return res.status(404).json({
        message: "No existe configuración del sistema",
      });
    }

    res.json(configuracion);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({
      message: "Error al obtener la configuración",
    });
  }
}

async function createConfiguracion(req, res) {
  try {
    const configuracion = await configuracionService.crearConfiguracion(
      req.body,
    );

    res.status(201).json({
      message: "Configuración creada correctamente",
      configuracion,
    });
  } catch (error) {
    console.error("Error al crear configuración:", error);
    res.status(500).json({
      message: "Error al crear la configuración",
    });
  }
}

async function updateConfiguracion(req, res) {
  try {
    const { id } = req.params;

    const configuracion = await configuracionService.actualizarConfiguracion(
      id,
      req.body,
    );

    if (!configuracion) {
      return res.status(404).json({
        message: "Configuración no encontrada",
      });
    }

    res.json({
      message: "Configuración actualizada correctamente",
      configuracion,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({
      message: "Error al actualizar la configuración",
    });
  }
}

async function saveConfiguracion(req, res) {
  try {
    const configuracion = await configuracionService.guardarConfiguracion(
      req.body,
    );

    res.json({
      message: "Configuración guardada correctamente",
      configuracion,
    });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({
      message: "Error al guardar la configuración",
    });
  }
}

module.exports = {
  getConfiguracion,
  createConfiguracion,
  updateConfiguracion,
  saveConfiguracion,
};
