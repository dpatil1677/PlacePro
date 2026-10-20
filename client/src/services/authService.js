// Auth context and service
const API_URL = '';

export const authService = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}). Please ensure the backend server is running on port 5001.`);
    }
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}). Please ensure the backend server is running on port 5001.`);
    }
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  saveSession(token, user) {
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
  },

  getToken() {
    return localStorage.getItem('pp_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('pp_user'));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};
