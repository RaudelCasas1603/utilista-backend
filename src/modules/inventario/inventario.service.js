const repo = require("./inventario.repository");

async function obtenerInventario() {
  return await repo.getAllInventario();
}

async function obtenerInventarioPorId(id) {
  const inventario = await repo.getInventarioById(id);

  if (!inventario) {
    throw new Error("Registro de inventario no encontrado");
  }

  return inventario;
}

async function obtenerInventarioPorProductoId(id_producto) {
  const inventario = await repo.getInventarioByProductoId(id_producto);

  if (!inventario) {
    throw new Error("Inventario del producto no encontrado");
  }

  return inventario;
}

async function crearInventario(data) {
  if (!data.id_producto) {
    throw new Error("id_producto es obligatorio");
  }

  const existente = await repo.getInventarioByProductoId(data.id_producto);
  if (existente) {
    throw new Error("Ese producto ya tiene inventario registrado");
  }

  const nuevoInventario = {
    id_producto: Number(data.id_producto),
    stock_actual: Number(data.stock_actual || 0),
    stock_minimo: Number(data.stock_minimo || 0),
    stock_deseado: Number(data.stock_deseado || 0),
  };

  return await repo.createInventario(nuevoInventario);
}

async function actualizarInventario(id, data) {
  const existente = await repo.getInventarioById(id);

  if (!existente) {
    throw new Error("Registro de inventario no encontrado");
  }

  const stockAnterior = Number(existente.stock_actual);

  const inventarioActualizado = {
    id_producto: Number(data.id_producto ?? existente.id_producto),
    stock_actual: Number(data.stock_actual ?? existente.stock_actual),
    stock_minimo: Number(data.stock_minimo ?? existente.stock_minimo),
    stock_deseado: Number(data.stock_deseado ?? existente.stock_deseado),
  };

  const inventario = await repo.updateInventario(id, inventarioActualizado);

  const stockNuevo = Number(inventario.stock_actual);
  const diferencia = stockNuevo - stockAnterior;

  if (diferencia !== 0) {
    await repo.createMovimientoInventario({
      id_producto: inventario.id_producto,
      tipo_movimiento: diferencia > 0 ? "entrada" : "salida",
      cantidad: Math.abs(diferencia),
      stock_anterior: stockAnterior,
      stock_nuevo: stockNuevo,
      motivo: data.motivo?.trim() || "Ajuste manual de inventario",
      id_usuario: data.id_usuario ? Number(data.id_usuario) : null,
      id_venta: data.id_venta ? Number(data.id_venta) : null,
    });
  }

  return inventario;
}

async function eliminarInventario(id) {
  const existente = await repo.getInventarioById(id);

  if (!existente) {
    throw new Error("Registro de inventario no encontrado");
  }

  return await repo.deleteInventario(id);
}

async function obtenerProveedoresReporteInventario() {
  const proveedores = await repo.getProveedoresReporteInventario();

  return [
    "Todos",
    ...proveedores
      .map((p) => p.empresa)
      .filter((empresa) => empresa && empresa.trim() !== ""),
  ];
}
async function obtenerReporteInventario(query) {
  const proveedor = query.proveedor || "Todos";
  const tipoReporte = query.tipoReporte || "debajo-minimo";

  const productos = await repo.getReporteInventario({
    proveedor,
    tipoReporte,
  });

  const productosAgrupados = productos.reduce((acc, producto) => {
    const proveedorNombre = producto.proveedor || "Sin proveedor";

    let faltantes = 0;

    if (tipoReporte === "sin-stock") {
      faltantes =
        Number(producto.stock_deseado) - Number(producto.stock_actual);
    } else if (tipoReporte === "debajo-minimo") {
      faltantes = Number(producto.stock_minimo) - Number(producto.stock_actual);
    } else {
      faltantes =
        Number(producto.stock_deseado) - Number(producto.stock_actual);
    }

    if (!acc[proveedorNombre]) {
      acc[proveedorNombre] = [];
    }

    acc[proveedorNombre].push({
      ...producto,
      faltantes: Math.max(faltantes, 0),
    });

    return acc;
  }, {});

  const proveedores = Object.entries(productosAgrupados).map(
    ([nombreProveedor, productosProveedor]) => ({
      proveedor: nombreProveedor,
      totalProductos: productosProveedor.length,
      productos: productosProveedor,
    }),
  );

  return {
    ok: true,
    filtros: {
      proveedor,
      tipoReporte,
    },
    totalProductos: productos.length,
    proveedores,
  };
}

module.exports = {
  obtenerInventario,
  obtenerInventarioPorId,
  obtenerInventarioPorProductoId,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
  obtenerProveedoresReporteInventario,
  obtenerReporteInventario,
};
