import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Backend wraps response in ApiResponse: { code, message, data: { token, refreshToken } }
    const authData = response.data?.data;
    if (authData?.token) {
      localStorage.setItem('access_token', authData.token);
      if (authData?.refreshToken) {
        localStorage.setItem('refresh_token', authData.refreshToken);
      }
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout API failed, clearing local state anyway');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
  
  // Additional methods like verifyEmail, etc. can go here based on backend spec.
};

export default authService;
