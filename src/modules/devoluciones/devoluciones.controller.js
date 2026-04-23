const service = require("./devoluciones.service");

async function crearDevolucion(req, res) {
  try {
    const data = req.body;
    const result = await service.crearDevolucion(data);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear devolución" });
  }
}

async function getAllDevoluciones(req, res) {
  try {
    const result = await service.getAllDevoluciones();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener devoluciones" });
  }
}

async function getDevolucionById(req, res) {
  try {
    const { id } = req.params;
    const result = await service.getDevolucionById(id);

    if (!result) {
      return res.status(404).json({ message: "No encontrada" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener devolución" });
  }
}

module.exports = {
  crearDevolucion,
  getAllDevoluciones,
  getDevolucionById,
};
