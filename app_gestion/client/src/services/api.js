/* ═══════════════════════════════════════════════════════════
   services/api.js
   Couche service vide — prête à brancher sur le vrai backend

   USAGE ACTUEL : les pages utilisent les données mock de data/mock.js
   MIGRATION    : remplacer chaque fonction par un vrai fetch/axios
   ═══════════════════════════════════════════════════════════ */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  // TODO: ajouter le token JWT ici
  // const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// ── Voyages ──────────────────────────────────────────────
export const voyagesApi = {
  getAll:    ()     => request('/voyages'),
  getById:   (id)   => request(`/voyages/${id}`),
  create:    (data) => request('/voyages',      { method: 'POST',   body: JSON.stringify(data) }),
  update:    (id, data) => request(`/voyages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:    (id)   => request(`/voyages/${id}`, { method: 'DELETE' }),
}

// ── Navires ───────────────────────────────────────────────
export const naviresApi = {
  getAll:   ()     => request('/navires'),
  getById:  (id)   => request(`/navires/${id}`),
  create:   (data) => request('/navires',       { method: 'POST',   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/navires/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:   (id)   => request(`/navires/${id}`, { method: 'DELETE' }),
}

// ── Clients ───────────────────────────────────────────────
export const clientsApi = {
  getAll:   ()     => request('/clients'),
  getById:  (id)   => request(`/clients/${id}`),
  create:   (data) => request('/clients',       { method: 'POST',   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:   (id)   => request(`/clients/${id}`, { method: 'DELETE' }),
}

// ── Cargaisons ────────────────────────────────────────────
export const cargaisonsApi = {
  getAll:   ()     => request('/cargaisons'),
  getById:  (id)   => request(`/cargaisons/${id}`),
  create:   (data) => request('/cargaisons',    { method: 'POST',   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/cargaisons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:   (id)   => request(`/cargaisons/${id}`, { method: 'DELETE' }),
}

// ── Employés ──────────────────────────────────────────────
export const employesApi = {
  getAll:   ()     => request('/employes'),
  getById:  (id)   => request(`/employes/${id}`),
  create:   (data) => request('/employes',      { method: 'POST',   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/employes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:   (id)   => request(`/employes/${id}`, { method: 'DELETE' }),
}

// ── Documents ─────────────────────────────────────────────
export const documentsApi = {
  getAll:   ()     => request('/documents'),
  getById:  (id)   => request(`/documents/${id}`),
  upload:   (data) => request('/documents',     { method: 'POST',   body: data }), // FormData
  delete:   (id)   => request(`/documents/${id}`, { method: 'DELETE' }),
}

// ── Finances ──────────────────────────────────────────────
export const financesApi = {
  getAll:   ()     => request('/finances'),
  getStats: ()     => request('/finances/stats'),
  create:   (data) => request('/finances',      { method: 'POST',   body: JSON.stringify(data) }),
}

// ── Dashboard ─────────────────────────────────────────────
export const dashboardApi = {
  getStats:  () => request('/dashboard/stats'),
  getAlerts: () => request('/dashboard/alerts'),
}
