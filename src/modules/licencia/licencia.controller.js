const service = require("./licencia.service");

const activarLicencia = async (req, res) => {
  try {
    const { licencia_key } = req.body;

    const data = await service.activarLicencia(licencia_key);

    res.json(data);
  } catch (error) {
    console.error("❌ Error activar licencia:", error);

    res.status(400).json({
      ok: false,
      estado: "error",
      mensaje: error.message,
    });
  }
};

const validarLicencia = async (req, res) => {
  try {
    const data = await service.validarLicencia();

    res.json(data);
  } catch (error) {
    console.error("❌ Error validar licencia:", error);

    res.status(400).json({
      ok: false,
      estado: "error",
      mensaje: error.message,
    });
  }
};

const obtenerEstadoLicencia = async (req, res) => {
  try {
    const data = await service.obtenerEstadoLicencia();

    res.json(data);
  } catch (error) {
    console.error("❌ Error obtener estado licencia:", error);

    res.status(400).json({
      ok: false,
      estado: "error",
      mensaje: error.message,
    });
  }
};

module.exports = {
  activarLicencia,
  validarLicencia,
  obtenerEstadoLicencia,
};
