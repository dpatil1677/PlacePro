// Admin API service — all calls use the Vite proxy (/api → http://localhost:5001)
const BASE = '/api/admin';

function getAuthHeaders() {
  const token = localStorage.getItem('pp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}). Please ensure the backend server is running.`);
  }
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}


/* ── Students ── */
export const adminStudentsApi = {
  list: (search = '') => apiFetch(`/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => apiFetch(`/students/${id}`),
  update: (id, data) => apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/students/${id}`, { method: 'DELETE' }),
};

/* ── Drives ── */
export const adminDrivesApi = {
  list: () => apiFetch('/drives'),
  get: (id) => apiFetch(`/drives/${id}`),
  create: (data) => apiFetch('/drives', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/drives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/drives/${id}`, { method: 'DELETE' }),
};

/* ── Questions ── */
export const adminQuestionsApi = {
  list: (search = '') => apiFetch(`/questions${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => apiFetch(`/questions/${id}`),
  create: (data) => apiFetch('/questions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/questions/${id}`, { method: 'DELETE' }),
};

/* ── Reports ── */
export const adminReportsApi = {
  get: () => apiFetch('/reports'),
};
