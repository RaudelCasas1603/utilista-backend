const service = require("./productos.service");

async function getProductos(req, res) {
  try {
    const data = await service.obtenerProductos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getProductoById(req, res) {
  try {
    const data = await service.obtenerProductoPorId(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createProducto(req, res) {
  try {
    const data = await service.crearProducto(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateProducto(req, res) {
  try {
    const data = await service.actualizarProducto(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteProducto(req, res) {
  try {
    const data = await service.eliminarProducto(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getByCodigoBarras(req, res) {
  try {
    const data = await service.obtenerPorCodigoBarras(req.params.codigo);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getByCodigoBarras,
};
