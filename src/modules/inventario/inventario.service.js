const repo = require("./inventario.repository");
const ExcelJS = require("exceljs");
const path = require("path");

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

async function exportarReporteInventarioExcel({ proveedor, tipoReporte }) {
  const productos = await repo.getReporteInventario({
    proveedor,
    tipoReporte,
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reporte de faltantes");

  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // Logo
  const logoPath = path.join(__dirname, "../../assets/logoUtilista.png");

  try {
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: "png",
    });

    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 160, height: 60 },
    });
  } catch {
    console.warn("No se encontró el logo, se generará sin imagen");
  }

  worksheet.mergeCells("C1:H1");
  worksheet.getCell("C1").value = "REPORTE DE FALTANTES";
  worksheet.getCell("C1").font = {
    size: 18,
    bold: true,
    color: { argb: "111827" },
  };
  worksheet.getCell("C1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("C2:H2");
  worksheet.getCell("C2").value =
    `Generado: ${new Date().toLocaleString("es-MX")}`;
  worksheet.getCell("C2").alignment = { horizontal: "center" };
  worksheet.getCell("C2").font = {
    size: 10,
    color: { argb: "6B7280" },
  };

  worksheet.getCell("A5").value = "Empresa:";
  worksheet.getCell("B5").value = proveedor;

  worksheet.getCell("A6").value = "Tipo de reporte:";
  worksheet.getCell("B6").value = tipoReporte;

  worksheet.getCell("A7").value = "Total productos:";
  worksheet.getCell("B7").value = productos.length;

  ["A5", "A6", "A7"].forEach((cell) => {
    worksheet.getCell(cell).font = { bold: true };
  });

  const headerRow = 9;

  worksheet.getRow(headerRow).values = [
    "Proveedor",
    "Código",
    "Código barras",
    "Producto",
    "Stock actual",
    "Stock mínimo",
    "Stock deseado",
    "Faltantes",
  ];

  worksheet.getRow(headerRow).font = {
    bold: true,
    color: { argb: "FFFFFF" },
  };

  worksheet.getRow(headerRow).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "0284C7" },
  };

  worksheet.getRow(headerRow).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  productos.forEach((item, index) => {
    const row = worksheet.getRow(headerRow + 1 + index);

    const faltantes =
      tipoReporte === "hacia-ideal"
        ? Number(item.stock_deseado) - Number(item.stock_actual)
        : tipoReporte === "debajo-minimo"
          ? Number(item.stock_minimo) - Number(item.stock_actual)
          : 0 - Number(item.stock_actual);

    row.values = [
      item.empresa,
      item.codigo_producto,
      item.codigo_barras,
      item.nombre,
      Number(item.stock_actual),
      Number(item.stock_minimo),
      Number(item.stock_deseado),
      Math.max(faltantes, 0),
    ];
  });

  worksheet.columns = [
    { width: 24 },
    { width: 16 },
    { width: 18 },
    { width: 38 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
  ];

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "E5E7EB" } },
        left: { style: "thin", color: { argb: "E5E7EB" } },
        bottom: { style: "thin", color: { argb: "E5E7EB" } },
        right: { style: "thin", color: { argb: "E5E7EB" } },
      };

      if (rowNumber > headerRow) {
        cell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      }
    });
  });

  worksheet.views = [{ state: "frozen", ySplit: headerRow }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
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
  exportarReporteInventarioExcel,
};
