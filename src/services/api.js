const BASE = '/api/prestamos'

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

export const api = {
  listar: () => fetch(BASE).then(handleResponse),
  obtener: (id) => fetch(`${BASE}/${id}`).then(handleResponse),
  crear: (body) => fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse),
  actualizar: (id, body) => fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse),
  actualizarEstado: (id, estado) => fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  }).then(handleResponse),
  eliminar: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse),
  registrarPago: (id, monto_cuota, nota) => fetch(`${BASE}/${id}/pagos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto_cuota, nota }),
  }).then(handleResponse),
  listarPagos: (id) => fetch(`${BASE}/${id}/pagos`).then(handleResponse),
  
}