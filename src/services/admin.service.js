import api from './api';

const adminService = {
  // ---- User Management ----
  getUsers: async (keyword = '', page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append('keyword', keyword);
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data?.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data?.data;
  },

  updateUserStatus: async (id, active) => {
    const response = await api.patch(`/admin/users/${id}/status`, { active });
    return response.data?.data;
  },

  softDeleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data?.message;
  },

  // ---- Dashboard Stats ----
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data?.data;
  },

  getDocumentTypeStats: async () => {
    const response = await api.get('/admin/dashboard/document-types');
    return response.data?.data;
  },

  getUploadTrend: async (days = 30) => {
    const response = await api.get(`/admin/dashboard/upload-trend?days=${days}`);
    return response.data?.data;
  },

  getAiUsage: async () => {
    const response = await api.get('/admin/dashboard/ai-usage');
    return response.data?.data;
  },

  // ---- System Config ----
  getAllConfigs: async () => {
    const response = await api.get('/admin/system-configs');
    return response.data?.data;
  },

  updateConfigs: async (configs) => {
    // configs is a key-value object
    const response = await api.put('/admin/system-configs', { configs });
    return response.data?.data;
  },

  // ---- Documents (Fallback to standard APIs if Admin APIs are missing) ----
  // We'll use the public search API for getting all docs if no specific admin API exists.
  getAllDocuments: async (keyword = '', page = 0, size = 20) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (keyword) params.append('keyword', keyword);
      // Attempting to use a standard search API.
      const response = await api.get(`/documents/public?${params.toString()}`);
      return response.data?.data;
    } catch (e) {
      console.warn('Fallback to standard document API failed', e);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  deleteDocument: async (id) => {
    // Assuming the service allows admin to bypass ownership
    const response = await api.delete(`/documents/${id}`);
    return response.data?.message;
  },

  // ---- Chat (Fallback to standard APIs if Admin APIs are missing) ----
  // If there's no Admin API to view all chats, we might get 403 or empty data.
  // We will add it as placeholder.
  getAllChatSessions: async () => {
    try {
      const response = await api.get('/admin/chat/sessions');
      return response.data?.data;
    } catch (err) {
      console.warn('Admin chat session API not found, falling back to empty list.');
      return [];
    }
  },

  deleteChatSession: async (id) => {
    const response = await api.delete(`/chat/sessions/${id}`);
    return response.data?.message;
  }
};

export default adminService;
