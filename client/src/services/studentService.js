// Student API service — all calls use the Vite proxy (/api → http://localhost:5001)
const BASE = '/api/student';

function getAuthHeaders() {
  const token = localStorage.getItem('pp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getAuthHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}). Please ensure the backend server is running.`);
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Dashboard
export const studentDashboardApi = {
  get: () => request('GET', '/dashboard'),
};

// Aptitude
export const aptitudeApi = {
  listTests: () => request('GET', '/aptitude/tests'),
  getTest: (id) => request('GET', `/aptitude/tests/${id}`),
  submitTest: (id, answers) => request('POST', `/aptitude/tests/${id}/submit`, { answers }),
  getResults: () => request('GET', '/aptitude/results'),
};

// Coding
export const codingApi = {
  listProblems: () => request('GET', '/coding/problems'),
  getProblem: (id) => request('GET', `/coding/problems/${id}`),
  runCode: (id, code, language) => request('POST', `/coding/problems/${id}/run`, { code, language }),
  submitCode: (id, code, language) => request('POST', `/coding/problems/${id}/submit`, { code, language }),
};

// Interview
export const interviewApi = {
  listTopics: (category) => request('GET', `/interview/topics${category ? `?category=${category}` : ''}`),
  getQuestions: (topicId) => request('GET', `/interview/topics/${topicId}/questions`),
  submitAnswer: (topicId, questionId, answer) =>
    request('POST', '/interview/submit', { topicId, questionId, answer }),
  getSessions: () => request('GET', '/interview/sessions'),
};

// Resume
export const resumeApi = {
  get: () => request('GET', '/resume'),
  update: (data) => request('PUT', '/resume', data),
  export: () => request('POST', '/resume/export'),
};

// Companies
export const companiesApi = {
  list: () => request('GET', '/companies'),
  get: (id) => request('GET', `/companies/${id}`),
};

// Progress
export const progressApi = {
  get: () => request('GET', '/progress'),
  getAchievements: () => request('GET', '/achievements'),
};
