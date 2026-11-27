// Auth context and service
const API_URL = import.meta.env.VITE_API_URL || 'https://placepro-1.onrender.com';

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

  async forgotPassword(email) {
    return this.sendPasswordResetOtp(email);
  },

  async sendPasswordResetOtp(email) {
    const res = await fetch(`${API_URL}/api/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}).`);
    }
    if (!res.ok) throw new Error(data.message || 'Failed to send verification code.');
    return data;
  },

  async verifyPasswordResetOtp(email, otp) {
    const res = await fetch(`${API_URL}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}).`);
    }
    if (!res.ok) throw new Error(data.message || 'Verification failed. Please check the code.');
    return data;
  },

  async resetPasswordWithOtp(email, resetToken, newPassword, confirmPassword) {
    const res = await fetch(`${API_URL}/api/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetToken, newPassword, confirmPassword }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Unable to reach server (${res.status} ${res.statusText || 'Bad Gateway'}).`);
    }
    if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
    return data;
  },

  saveSession(token, user, remember = true) {
    if (remember) {
      localStorage.setItem('pp_token', token);
      localStorage.setItem('pp_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('pp_token', token);
      sessionStorage.setItem('pp_user', JSON.stringify(user));
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
    }
  },

  clearSession() {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    sessionStorage.removeItem('pp_token');
    sessionStorage.removeItem('pp_user');
  },

  getToken() {
    return localStorage.getItem('pp_token') || sessionStorage.getItem('pp_token');
  },

  getUser() {
    try {
      const stored = localStorage.getItem('pp_user') || sessionStorage.getItem('pp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};
