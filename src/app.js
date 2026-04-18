const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const productosRoutes = require("./modules/productos/productos.routes");
const { inventarioRoutes } = require("./modules/inventario");
const { proveedoresRoutes } = require("./modules/proveedores");
const { clientesRoutes } = require("./modules/clientes");
const { categoriasRoutes } = require("./modules/categorias");
const { configuracionRoutes } = require("./modules/configuracion");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Backend hola" });
});

// Test de base de datos
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      fecha: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: "Error al conectar con la base de datos",
    });
  }
});

app.use("/api/productos", productosRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/configuracion", configuracionRoutes);

module.exports = app;
