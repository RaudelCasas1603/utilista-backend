const pool = require("../../config/db");
const { Printer } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");
const ptp = require("pdf-to-printer");

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function textoSeguro(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function listarImpresoras() {
  const impresoras = await ptp.getPrinters();

  return impresoras.map((impresora) => ({
    nombre: impresora.name,
    default: impresora.isDefault || false,
  }));
}

async function obtenerConfiguracionSistema() {
  const result = await pool.query(`
    SELECT
      nombre_negocio,
      telefono_negocio,
      direccion_negocio,
      habilitar_impresora,
      nombre_impresora,
      mensaje_ticket
    FROM configuracion_sistema
    ORDER BY id ASC
    LIMIT 1
  `);

  return result.rows[0] || null;
}

async function obtenerVentaCabecera(idVenta) {
  const result = await pool.query(
    `
    SELECT
      v.*,
      c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    WHERE v.id = $1
    `,
    [idVenta],
  );

  return result.rows[0] || null;
}

async function obtenerDetalleVenta(idVenta) {
  const result = await pool.query(
    `
    SELECT
      vd.*,
      p.nombre
    FROM ventas_detalle vd
    INNER JOIN productos p ON p.id = vd.id_producto
    WHERE vd.id_venta = $1
    ORDER BY vd.id ASC
    `,
    [idVenta],
  );

  return result.rows;
}

/**
 * 🔥 CREA IMPRESORA USANDO CONFIG
 */
function crearImpresora(config) {
  const options = {
    encoding: "GB18030",
  };

  try {
    if (config.nombre_impresora) {
      const device = new USB(config.nombre_impresora);
      const printer = new Printer(device, options);

      console.log("🖨️ Usando impresora configurada:", config.nombre_impresora);

      return { device, printer };
    }
  } catch (error) {
    console.warn("⚠️ No se pudo usar impresora por nombre:", error.message);
  }

  console.log("🖨️ Usando impresora USB directa");

  const device = new USB();
  const printer = new Printer(device, options);

  return { device, printer };
}

function imprimirLineaProducto(printer, item) {
  const nombre = textoSeguro(item.nombre || "Producto");
  const cantidad = Number(item.cantidad || 0);
  const precio = money(item.precio_unitario);
  const subtotal = money(item.subtotal);

  printer.text(nombre);

  const izquierda = `${cantidad} x ${precio}`;
  const derecha = subtotal;

  printer.text(`${izquierda.padEnd(24, " ")}${derecha}`);
}

/**
 * 🧾 FUNCIÓN PRINCIPAL
 */
async function imprimirTicketVenta(idVenta) {
  console.log("🧾 === IMPRIMIENDO TICKET ===");

  const config = await obtenerConfiguracionSistema();

  if (!config) {
    throw new Error("No existe configuración del sistema");
  }

  if (!config.habilitar_impresora) {
    throw new Error("La impresión está deshabilitada");
  }

  if (!config.nombre_impresora) {
    console.warn("⚠️ No hay impresora configurada, usando USB directo");
  }

  const venta = await obtenerVentaCabecera(idVenta);

  if (!venta) {
    throw new Error("Venta no encontrada");
  }

  const detalle = await obtenerDetalleVenta(idVenta);

  if (!detalle.length) {
    throw new Error("La venta no tiene productos");
  }

  const { device, printer } = crearImpresora(config);

  return new Promise((resolve, reject) => {
    device.open((error) => {
      if (error) {
        console.error("❌ Error al abrir impresora:", error);
        return reject(new Error("No se pudo conectar con la impresora"));
      }

      try {
        /**
         * 🔹 HEADER (CON CONFIG)
         */
        printer
          .align("ct")
          .style("b")
          .size(1, 1)
          .text(textoSeguro(config.nombre_negocio || "UTILISTA POS"))
          .style("normal");

        if (config.telefono_negocio) {
          printer.text(`Tel: ${textoSeguro(config.telefono_negocio)}`);
        }

        if (config.direccion_negocio) {
          printer.text(textoSeguro(config.direccion_negocio));
        }

        printer.drawLine();

        /**
         * 🔹 INFO VENTA
         */
        printer
          .align("lt")
          .text(`Folio: ${venta.folio || venta.id}`)
          .text(`Fecha: ${formatDate(venta.fecha_hora)}`)
          .text(`Cliente: ${textoSeguro(venta.cliente_nombre || "General")}`)
          .text(`Pago: ${venta.metodo_pago}`)
          .drawLine();

        /**
         * 🔹 DETALLE
         */
        detalle.forEach((item) => {
          imprimirLineaProducto(printer, item);
        });

        printer.drawLine();

        /**
         * 🔹 TOTALES
         */
        if (Number(venta.descuento || 0) > 0) {
          printer.align("rt").text(`Descuento: -${money(venta.descuento)}`);
        }

        printer
          .align("rt")
          .text(`Subtotal: ${money(venta.subtotal)}`)
          .style("b")
          .size(1, 1)
          .text(`TOTAL: ${money(venta.total)}`)
          .style("normal")
          .size(0, 0);

        /**
         * 🔹 MENSAJE FINAL (CONFIG)
         */
        if (config.mensaje_ticket) {
          printer
            .drawLine()
            .align("ct")
            .text(textoSeguro(config.mensaje_ticket));
        }

        /**
         * 🔹 FINAL
         */
        printer
          .feed(2)
          .cut()
          .close(() => {
            console.log("✅ Ticket impreso correctamente");

            resolve({
              idVenta: venta.id,
              folio: venta.folio,
              impresora: config.nombre_impresora || "USB directa",
              total: venta.total,
              productos: detalle.length,
            });
          });
      } catch (err) {
        console.error("❌ Error durante impresión:", err);
        reject(err);
      }
    });
  });
}

module.exports = {
  imprimirTicketVenta,
  listarImpresoras,
};
