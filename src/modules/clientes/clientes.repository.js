const pool = require("../../config/db");

async function getAll() {
  const result = await pool.query(`
    SELECT *
    FROM clientes
    ORDER BY id ASC
  `);
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(`SELECT * FROM clientes WHERE id = $1`, [id]);
  return result.rows[0];
}

async function create(data) {
  const result = await pool.query(
    `
    INSERT INTO clientes (
      nombre,
      telefono,
      correo,
      descuento,
      referencia,
      estatus
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      data.nombre,
      data.telefono,
      data.correo,
      data.descuento,
      data.referencia,
      data.estatus,
    ],
  );

  return result.rows[0];
}

async function update(id, data) {
  const result = await pool.query(
    `
    UPDATE clientes
    SET
      nombre = $1,
      telefono = $2,
      correo = $3,
      descuento = $4,
      referencia = $5,
      estatus = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
    `,
    [
      data.nombre,
      data.telefono,
      data.correo,
      data.descuento,
      data.referencia,
      data.estatus,
      id,
    ],
  );

  return result.rows[0];
}

async function updateEstatus(id, estatus) {
  const result = await pool.query(
    `
    UPDATE clientes
    SET
      estatus = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [estatus, id],
  );

  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    `DELETE FROM clientes WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateEstatus,
  remove,
};
