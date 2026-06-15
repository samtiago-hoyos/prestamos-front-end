// services/api.js — Capa de comunicación con el back-end

const BASE = '/api/prestamos'

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

export const api = {
  /** Listar todos los préstamos */
  listar: () =>
    fetch(BASE).then(handleResponse),

  /** Obtener detalle por ID */
  obtener: (id) =>
    fetch(`${BASE}/${id}`).then(handleResponse),

  /** Registrar nuevo préstamo */
  crear: (body) =>
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  /** Actualizar estado */
  actualizarEstado: (id, estado) =>
    fetch(`${BASE}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    }).then(handleResponse),

  /** Eliminar préstamo */
  eliminar: (id) =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse),
}
