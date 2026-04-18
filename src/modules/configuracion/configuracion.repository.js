const pool = require("../../config/db");

async function get() {
  const result = await pool.query(`
    SELECT * FROM configuracion_sistema
    LIMIT 1
  `);

  return result.rows[0];
}

async function createDefault() {
  const result = await pool.query(`
    INSERT INTO configuracion_sistema DEFAULT VALUES
    RETURNING *
  `);

  return result.rows[0];
}

async function update(data) {
  const result = await pool.query(
    `
    UPDATE configuracion_sistema
    SET
      nombre_negocio = $1,
      telefono_negocio = $2,
      direccion_negocio = $3,
      nombre_banco = $4,
      numero_cuenta = $5,
      nombre_titular = $6,
      proveedor_terminal = $7,
      comision_terminal = $8,
      habilitar_impresora = $9,
      nombre_impresora = $10,
      mensaje_ticket = $11,
      logo_url = $12,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $13
    RETURNING *
    `,
    [
      data.nombre_negocio,
      data.telefono_negocio,
      data.direccion_negocio,
      data.nombre_banco,
      data.numero_cuenta,
      data.nombre_titular,
      data.proveedor_terminal,
      data.comision_terminal,
      data.habilitar_impresora,
      data.nombre_impresora,
      data.mensaje_ticket,
      data.logo_url,
      data.id,
    ],
  );

  return result.rows[0];
}

module.exports = {
  get,
  createDefault,
  update,
};
