const pool = require("../../config/db");

async function getAll() {
  const res = await pool.query(`
    SELECT * FROM categorias
    ORDER BY id ASC
  `);
  return res.rows;
}

async function getById(id) {
  const res = await pool.query(`SELECT * FROM categorias WHERE id = $1`, [id]);
  return res.rows[0];
}

async function create(data) {
  const res = await pool.query(
    `
    INSERT INTO categorias (
      nombre,
      descripcion,
      estatus
    )
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [data.nombre, data.descripcion, data.estatus],
  );

  return res.rows[0];
}

async function update(id, data) {
  const res = await pool.query(
    `
    UPDATE categorias
    SET
      nombre = $1,
      descripcion = $2,
      estatus = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [data.nombre, data.descripcion, data.estatus, id],
  );

  return res.rows[0];
}

async function updateEstatus(id, estatus) {
  const res = await pool.query(
    `
    UPDATE categorias
    SET
      estatus = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [estatus, id],
  );

  return res.rows[0];
}

async function remove(id) {
  const res = await pool.query(
    `DELETE FROM categorias WHERE id = $1 RETURNING *`,
    [id],
  );
  return res.rows[0];
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateEstatus,
  remove,
};
