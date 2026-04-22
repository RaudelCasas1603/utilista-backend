const pool = require("../../config/db");
const { Printer } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");

const TICKET_WIDTH = 48; // 80mm aprox

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function line(width = TICKET_WIDTH) {
  return "-".repeat(width);
}

function rightText(label, value, width = TICKET_WIDTH) {
  const left = String(label ?? "");
  const right = String(value ?? "");
  const spaces = width - left.length - right.length;

  if (spaces <= 1) return `${left} ${right}`;
  return `${left}${" ".repeat(spaces)}${right}`;
}

function truncateText(text, max = TICKET_WIDTH) {
  const value = String(text ?? "");
  if (value.length <= max) return value;
  return value.slice(0, max - 3) + "...";
}

async function obtenerVentaCabecera(idVenta) {
  const result = await pool.query(
    `
    SELECT
      v.id,
      v.folio,
      v.fecha_hora,
      v.id_cliente,
      v.id_usuario,
      v.subtotal,
      v.descuento,
      v.metodo_pago,
      v.total,
      v.total_articulos,
      v.estatus,
      v.observaciones,
      c.nombre AS cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON c.id = v.id_cliente
    WHERE v.id = $1
    `,
    [idVenta],
  );

  return result.rows[0];
}

async function obtenerDetalleVenta(idVenta) {
  const result = await pool.query(
    `
    SELECT
      vd.id,
      vd.id_venta,
      vd.id_producto,
      vd.cantidad,
      vd.precio_unitario,
      vd.descuento_unitario,
      vd.subtotal,
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

async function imprimirTicketVenta(idVenta) {
  console.log("🧾 === IMPRIMIENDO TICKET ===");
  console.log("ID Venta:", idVenta);

  const venta = await obtenerVentaCabecera(idVenta);

  if (!venta) {
    throw new Error("Venta no encontrada");
  }

  const detalle = await obtenerDetalleVenta(idVenta);

  if (!detalle.length) {
    throw new Error("La venta no tiene detalle");
  }

  const device = new USB();

  return new Promise((resolve, reject) => {
    device.open(async (err) => {
      if (err) {
        console.error("❌ Error al abrir USB:", err);
        return reject(err);
      }

      try {
        const printer = new Printer(device, {
          encoding: "GB18030",
        });

        // Encabezado centrado
        await printer
          .align("ct")
          .style("b")
          .text("UTILISTA")
          .style("normal")
          .text("Ticket de venta")
          .text(line());

        // Contenido alineado a la izquierda
        await printer
          .align("lt")
          .text(`Folio: ${venta.folio || venta.id}`)
          .text(`Fecha: ${new Date(venta.fecha_hora).toLocaleString("es-MX")}`)
          .text(`Cliente: ${venta.cliente_nombre || "Publico general"}`)
          .text(`Pago: ${venta.metodo_pago || "No definido"}`)
          .text(
            `Total de articulos: ${venta.total_articulos || detalle.length}`,
          )
          .text(line());

        for (const item of detalle) {
          const nombre = truncateText(item.nombre || "Producto", TICKET_WIDTH);
          const qtyPrice = `${item.cantidad} x ${money(item.precio_unitario)}`;
          const totalLinea = money(item.subtotal);

          await printer.text(nombre);
          await printer.text(rightText(qtyPrice, totalLinea, TICKET_WIDTH));
        }

        await printer.text(line());

        if (Number(venta.descuento || 0) > 0) {
          await printer.text(
            rightText("DESCUENTO", `-${money(venta.descuento)}`, TICKET_WIDTH),
          );
        }

        await printer
          .style("b")
          .text(rightText("SUBTOTAL", money(venta.subtotal), TICKET_WIDTH))
          .text(rightText("TOTAL", money(venta.total), TICKET_WIDTH))
          .style("normal");

        if (venta.observaciones) {
          await printer.text(line());
          await printer.text("Observaciones:");
          await printer.text(truncateText(venta.observaciones, TICKET_WIDTH));
        }

        await printer
          .text("")
          .align("ct")
          .text("Gracias por su compra")
          .text("")
          .cut()
          .close();

        console.log("✅ Ticket impreso correctamente");

        resolve({
          idVenta: venta.id,
          folio: venta.folio,
          productos: detalle.length,
          total: venta.total,
        });
      } catch (error) {
        console.error("❌ Error al imprimir:", error);
        reject(error);
      }
    });
  });
}

module.exports = {
  imprimirTicketVenta,
};
