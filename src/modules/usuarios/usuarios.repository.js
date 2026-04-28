const pool = require("../../config/db");

async function findAll({ search }) {
  let query = `
    SELECT id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    FROM usuarios
  `;

  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += `
      WHERE nombre ILIKE $1
      OR username ILIKE $1
      OR rol::text ILIKE $1
    `;
  }

  query += ` ORDER BY id ASC`;

  const result = await pool.query(query, params);
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `
    SELECT id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    FROM usuarios
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

async function findByUsername(username) {
  const result = await pool.query(
    `
    SELECT *
    FROM usuarios
    WHERE username = $1
    LIMIT 1
    `,
    [username],
  );

  return result.rows[0] || null;
}

async function createUsuario(data) {
  const { nombre, username, password_hash, rol } = data;

  const result = await pool.query(
    `
    INSERT INTO usuarios (
      nombre,
      username,
      password_hash,
      rol,
      estatus
    )
    VALUES ($1, $2, $3, $4::rol_usuario, 'activo'::estatus_general)
    RETURNING id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    `,
    [nombre, username, password_hash, rol],
  );

  return result.rows[0];
}

async function updateUsuario(id, data) {
  const { nombre, username, rol } = data;

  const result = await pool.query(
    `
    UPDATE usuarios
    SET
      nombre = $1,
      username = $2,
      rol = $3::rol_usuario,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    `,
    [nombre, username, rol, id],
  );

  return result.rows[0] || null;
}

async function updatePassword(id, password_hash) {
  const result = await pool.query(
    `
    UPDATE usuarios
    SET
      password_hash = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    `,
    [password_hash, id],
  );

  return result.rows[0] || null;
}

async function updateEstatus(id, estatus) {
  const result = await pool.query(
    `
    UPDATE usuarios
    SET
      estatus = $1::estatus_general,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    `,
    [estatus, id],
  );

  return result.rows[0] || null;
}

async function updateUltimoAcceso(id) {
  const result = await pool.query(
    `
    UPDATE usuarios
    SET ultimo_acceso = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, nombre, username, rol, estatus, ultimo_acceso, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  createUsuario,
  updateUsuario,
  updatePassword,
  updateEstatus,
  updateUltimoAcceso,
};
