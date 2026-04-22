const service = require("./mov_inventario.service");

async function getMovimientosByProducto(req, res) {
  try {
    const { id_producto } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const idProductoNumber = Number(id_producto);

    if (!Number.isInteger(idProductoNumber) || idProductoNumber <= 0) {
      return res.status(400).json({
        message: "El id_producto no es válido",
      });
    }

    const data = await service.getMovimientosByProducto({
      id_producto: idProductoNumber,
      page,
      limit,
    });

    res.json(data);
  } catch (error) {
    console.error("Error en getMovimientosByProducto:", error);
    res.status(500).json({
      message: "No se pudieron obtener los movimientos del producto",
    });
  }
}

module.exports = {
  getMovimientosByProducto,
};
