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

/* ── Dashboard ── */
export const adminDashboardApi = {
  get: () => apiFetch('/dashboard'),
};

/* ── Students ── */
export const adminStudentsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.branch) q.set('branch', params.branch);
    const qs = q.toString();
    return apiFetch(`/students${qs ? `?${qs}` : ''}`);
  },
  get: (id) => apiFetch(`/students/${id}`),
  create: (data) => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) }),
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

/* ── Applications ── */
export const adminApplicationsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.driveId) q.set('driveId', params.driveId);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const qs = q.toString();
    return apiFetch(`/applications${qs ? `?${qs}` : ''}`);
  },
  update: (id, data) => apiFetch(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  bulkUpdate: (ids, status) => apiFetch('/applications/bulk/update', { method: 'PUT', body: JSON.stringify({ ids, status }) }),
};

/* ── Companies ── */
export const adminCompaniesApi = {
  list: (search = '') => apiFetch(`/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => apiFetch(`/companies/${id}`),
  create: (data) => apiFetch('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/companies/${id}`, { method: 'DELETE' }),
};

/* ── Questions ── */
export const adminQuestionsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.category) q.set('category', params.category);
    if (params.type) q.set('type', params.type);
    if (params.difficulty) q.set('difficulty', params.difficulty);
    const qs = q.toString();
    return apiFetch(`/questions${qs ? `?${qs}` : ''}`);
  },
  get: (id) => apiFetch(`/questions/${id}`),
  create: (data) => apiFetch('/questions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/questions/${id}`, { method: 'DELETE' }),
};

/* ── Notifications ── */
export const adminNotificationsApi = {
  list: () => apiFetch('/notifications'),
  create: (data) => apiFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
};

/* ── Reports ── */
export const adminReportsApi = {
  get: () => apiFetch('/reports'),
};

/* ── Activity Logs ── */
export const adminActivityApi = {
  get: () => apiFetch('/activity-logs'),
};

/* ── Settings ── */
export const adminSettingsApi = {
  getProfile: () => apiFetch('/profile'),
  updatePassword: (data) => apiFetch('/password', { method: 'PUT', body: JSON.stringify(data) }),
};

/* ── Aptitude Test Management ── */
export const adminAptitudeApi = {
  list: () => apiFetch('/aptitude-tests'),
  create: (data) => apiFetch('/aptitude-tests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/aptitude-tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/aptitude-tests/${id}`, { method: 'DELETE' }),
  getResults: (testId) => apiFetch(testId ? `/aptitude-tests/${testId}/results` : '/aptitude-tests/results'),
};

/* ── Coding Problem Management ── */
export const adminCodingApi = {
  list: () => apiFetch('/coding-problems'),
  create: (data) => apiFetch('/coding-problems', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/coding-problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/coding-problems/${id}`, { method: 'DELETE' }),
};

/* ── Interview Topic Management ── */
export const adminInterviewApi = {
  list: () => apiFetch('/interview-topics'),
  create: (data) => apiFetch('/interview-topics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/interview-topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/interview-topics/${id}`, { method: 'DELETE' }),
};

/* ── Student Performance ── */
export const adminPerformanceApi = {
  getStudentPerformance: (studentId) => apiFetch(`/students/${studentId}/performance`),
};
