import api from './api';

const profileService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data?.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data?.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data?.message;
  }
};

export default profileService;
