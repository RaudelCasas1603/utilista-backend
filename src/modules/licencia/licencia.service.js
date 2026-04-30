const os = require("os");
const pool = require("../../config/db");

const LICENCIAS_API_URL =
  process.env.LICENCIAS_API_URL || "http://localhost:4000/api/licencias";

function obtenerHardwareId() {
  return process.env.HARDWARE_ID || os.hostname();
}

const obtenerEstadoLicencia = async () => {
  const result = await pool.query(`
    SELECT *
    FROM licencia
    ORDER BY id DESC
    LIMIT 1
  `);

  const licencia = result.rows[0];

  if (!licencia) {
    return {
      ok: false,
      estado: "sin_licencia",
      mensaje: "No existe una licencia activada en este equipo",
    };
  }

  return {
    ok: licencia.estado === "activa",
    estado: licencia.estado,
    mensaje: licencia.mensaje,
    licencia,
  };
};

const activarLicencia = async (licencia_key) => {
  if (!licencia_key) {
    throw new Error("La clave de licencia es obligatoria");
  }

  const hardware_id = obtenerHardwareId();

  const response = await fetch(`${LICENCIAS_API_URL}/activar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      licencia_key,
      hardware_id,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    await guardarLicenciaLocal({
      licencia_key,
      estado: data.estado || "error",
      hardware_id,
      mensaje: data.mensaje || "No se pudo activar la licencia",
    });

    return {
      ok: false,
      estado: data.estado || "error",
      mensaje: data.mensaje || "No se pudo activar la licencia",
    };
  }

  await guardarLicenciaLocal({
    licencia_key,
    estado: "activa",
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    hardware_id,
    mensaje: "Licencia activada correctamente",
  });

  return {
    ok: true,
    estado: "activa",
    mensaje: "Licencia activada correctamente",
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
  };
};

const validarLicencia = async () => {
  const estadoLocal = await obtenerEstadoLicencia();

  if (!estadoLocal.licencia) {
    return estadoLocal;
  }

  const licencia = estadoLocal.licencia;
  const hardware_id = obtenerHardwareId();

  const hoy = new Date();
  const fechaFin = licencia.fecha_fin ? new Date(licencia.fecha_fin) : null;

  if (fechaFin && fechaFin < hoy) {
    await actualizarEstadoLocal({
      estado: "vencida",
      mensaje: "La licencia está vencida",
    });

    return {
      ok: false,
      estado: "vencida",
      mensaje: "La licencia está vencida",
      fecha_fin: licencia.fecha_fin,
    };
  }

  const response = await fetch(`${LICENCIAS_API_URL}/validar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      licencia_key: licencia.licencia_key,
      hardware_id,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    await actualizarEstadoLocal({
      estado: data.estado || "error",
      mensaje: data.mensaje || "No se pudo validar la licencia",
    });

    return {
      ok: false,
      estado: data.estado || "error",
      mensaje: data.mensaje || "No se pudo validar la licencia",
    };
  }

  await guardarLicenciaLocal({
    licencia_key: licencia.licencia_key,
    estado: "activa",
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    hardware_id,
    mensaje: "Licencia válida",
  });

  return {
    ok: true,
    estado: "activa",
    mensaje: "Licencia válida",
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
  };
};

async function guardarLicenciaLocal({
  licencia_key,
  estado,
  fecha_inicio = null,
  fecha_fin = null,
  hardware_id = null,
  mensaje = null,
}) {
  const existente = await pool.query(`
    SELECT id
    FROM licencia
    ORDER BY id DESC
    LIMIT 1
  `);

  if (existente.rows.length > 0) {
    await pool.query(
      `
      UPDATE licencia
      SET licencia_key = $1,
          estado = $2,
          fecha_inicio = $3,
          fecha_fin = $4,
          hardware_id = $5,
          ultimo_check = NOW(),
          proximo_check = NOW() + INTERVAL '1 day',
          mensaje = $6,
          updated_at = NOW()
      WHERE id = $7
      `,
      [
        licencia_key,
        estado,
        fecha_inicio,
        fecha_fin,
        hardware_id,
        mensaje,
        existente.rows[0].id,
      ],
    );
    return;
  }

  await pool.query(
    `
    INSERT INTO licencia (
      licencia_key,
      estado,
      fecha_inicio,
      fecha_fin,
      hardware_id,
      ultimo_check,
      proximo_check,
      mensaje
    )
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '1 day', $6)
    `,
    [licencia_key, estado, fecha_inicio, fecha_fin, hardware_id, mensaje],
  );
}

async function actualizarEstadoLocal({ estado, mensaje }) {
  await pool.query(
    `
    UPDATE licencia
    SET estado = $1,
        mensaje = $2,
        ultimo_check = NOW(),
        updated_at = NOW()
    WHERE id = (
      SELECT id
      FROM licencia
      ORDER BY id DESC
      LIMIT 1
    )
    `,
    [estado, mensaje],
  );
}

module.exports = {
  activarLicencia,
  validarLicencia,
  obtenerEstadoLicencia,
};
