function validarProducto(data) {
  if (!data.nombre) throw new Error("Nombre obligatorio");
  if (data.precio_venta < 0) throw new Error("Precio inválido");
}

module.exports = { validarProducto };
