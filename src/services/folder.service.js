import api from './api';

const folderService = {
  getFolders: async () => {
    const response = await api.get('/folders');
    return response.data?.data || [];
  },

  createFolder: async (folderData) => {
    const response = await api.post('/folders', folderData);
    return response.data?.data;
  },

  updateFolder: async (id, folderData) => {
    const response = await api.put(`/folders/${id}`, folderData);
    return response.data?.data;
  },

  deleteFolder: async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  }
};

export default folderService;
