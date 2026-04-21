const { Printer } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");

const device = new USB();

device.open(async function (err) {
  if (err) {
    console.error("❌ Error al abrir la impresora:", err);
    return;
  }

  try {
    const printer = new Printer(device, { encoding: "GB18030" });

    await printer
      .align("ct")
      .style("b")
      .text("UTILISTA")
      .text("Prueba de impresion")
      .text("--------------------------")
      .text("Hola mundo")
      .cut()
      .close();

    console.log("✅ Impresión enviada");
  } catch (error) {
    console.error("❌ Error imprimiendo:", error);
  }
});
