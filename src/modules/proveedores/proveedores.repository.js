const pool = require("../../config/db");

async function getAll() {
  const res = await pool.query(`
    SELECT * FROM proveedores
    ORDER BY id ASC
  `);
  return res.rows;
}

async function getById(id) {
  const res = await pool.query(`SELECT * FROM proveedores WHERE id = $1`, [id]);
  return res.rows[0];
}

async function create(data) {
  const res = await pool.query(
    `
    INSERT INTO proveedores (
      nombre,
      telefono,
      correo,
      empresa,
      referencia,
      estatus
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [
      data.nombre,
      data.telefono,
      data.correo,
      data.empresa,
      data.referencia,
      data.estatus,
    ],
  );

  return res.rows[0];
}

async function update(id, data) {
  const res = await pool.query(
    `
    UPDATE proveedores SET
      nombre = $1,
      telefono = $2,
      correo = $3,
      empresa = $4,
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
      data.empresa,
      data.referencia,
      data.estatus,
      id,
    ],
  );

  return res.rows[0];
}

async function updateEstatus(id, estatus) {
  const res = await pool.query(
    `
    UPDATE proveedores
    SET estatus = $1,
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
    `DELETE FROM proveedores WHERE id = $1 RETURNING *`,
    [id],
  );
  return res.rows[0];
}

async function getStatsByProveedor(id) {
  const res = await pool.query(
    `
    SELECT
      COUNT(p.id) AS total_productos,
      ROUND(
        CASE
          WHEN (SELECT COUNT(*) FROM productos) = 0 THEN 0
          ELSE (COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM productos))
        END,
        2
      ) AS porcentaje_participacion
    FROM productos p
    WHERE p.id_proveedor = $1
    `,
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
  getStatsByProveedor,
};
