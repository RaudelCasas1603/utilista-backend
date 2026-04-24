const pool = require("../../config/db");

async function getConfiguracion() {
  const result = await pool.query(`
    SELECT
      id,
      nombre_negocio,
      telefono_negocio,
      direccion_negocio,
      nombre_banco,
      numero_cuenta,
      nombre_titular,
      proveedor_terminal,
      comision_terminal,
      habilitar_impresora,
      nombre_impresora,
      mensaje_ticket,
      logo_url,
      updated_at
    FROM configuracion_sistema
    ORDER BY id ASC
    LIMIT 1
  `);

  return result.rows[0] || null;
}

async function createConfiguracion(data) {
  const result = await pool.query(
    `
    INSERT INTO configuracion_sistema (
      nombre_negocio,
      telefono_negocio,
      direccion_negocio,
      nombre_banco,
      numero_cuenta,
      nombre_titular,
      proveedor_terminal,
      comision_terminal,
      habilitar_impresora,
      nombre_impresora,
      mensaje_ticket,
      logo_url,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      COALESCE($8, 0),
      COALESCE($9, false),
      $10, $11, $12, NOW()
    )
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
    ],
  );

  return result.rows[0];
}

async function updateConfiguracion(id, data) {
  const result = await pool.query(
    `
    UPDATE configuracion_sistema
    SET
      nombre_negocio = COALESCE($1, nombre_negocio),
      telefono_negocio = COALESCE($2, telefono_negocio),
      direccion_negocio = COALESCE($3, direccion_negocio),
      nombre_banco = COALESCE($4, nombre_banco),
      numero_cuenta = COALESCE($5, numero_cuenta),
      nombre_titular = COALESCE($6, nombre_titular),
      proveedor_terminal = COALESCE($7, proveedor_terminal),
      comision_terminal = COALESCE($8, comision_terminal),
      habilitar_impresora = COALESCE($9, habilitar_impresora),
      nombre_impresora = COALESCE($10, nombre_impresora),
      mensaje_ticket = COALESCE($11, mensaje_ticket),
      logo_url = COALESCE($12, logo_url),
      updated_at = NOW()
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
      id,
    ],
  );

  return result.rows[0] || null;
}

async function upsertConfiguracion(data) {
  const actual = await getConfiguracion();

  if (!actual) {
    return createConfiguracion(data);
  }

  return updateConfiguracion(actual.id, data);
}

module.exports = {
  getConfiguracion,
  createConfiguracion,
  updateConfiguracion,
  upsertConfiguracion,
};
