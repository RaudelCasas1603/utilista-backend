const pool = require("../config/db");

async function validarLicenciaMiddleware(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM licencia
      ORDER BY id DESC
      LIMIT 1
    `);

    const licencia = result.rows[0];

    if (!licencia) {
      return res.status(403).json({
        ok: false,
        estado: "sin_licencia",
        mensaje: "No existe una licencia activa",
      });
    }

    if (licencia.estado !== "activa") {
      return res.status(403).json({
        ok: false,
        estado: licencia.estado,
        mensaje: licencia.mensaje || "La licencia no está activa",
      });
    }

    const hoy = new Date();
    const fechaFin = new Date(licencia.fecha_fin);

    if (fechaFin < hoy) {
      await pool.query(
        `
        UPDATE licencia
        SET estado = 'vencida',
            mensaje = 'La licencia está vencida',
            updated_at = NOW()
        WHERE id = $1
        `,
        [licencia.id],
      );

      return res.status(403).json({
        ok: false,
        estado: "vencida",
        mensaje: "La licencia está vencida",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Error middleware licencia:", error);

    return res.status(403).json({
      ok: false,
      estado: "error",
      mensaje: "No se pudo validar la licencia",
    });
  }
}

module.exports = validarLicenciaMiddleware;
