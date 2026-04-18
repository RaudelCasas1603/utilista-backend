const service = require("./categorias.service");

async function getCategorias(req, res) {
  try {
    const data = await service.obtenerCategorias();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function getCategoriaById(req, res) {
  try {
    const data = await service.obtenerCategoriaPorId(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
}

async function createCategoria(req, res) {
  try {
    const data = await service.crearCategoria(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function updateCategoria(req, res) {
  try {
    const data = await service.actualizarCategoria(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function deleteCategoria(req, res) {
  try {
    const data = await service.eliminarCategoria(req.params.id);
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

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  updateEstatus,
};
