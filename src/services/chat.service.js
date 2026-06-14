import api from './api';

const chatService = {
  chat: async (message, sessionId = null) => {
    const payload = { message };
    if (sessionId) payload.sessionId = sessionId;
    const response = await api.post('/chat', payload);
    return response.data?.data; // Returns ChatResponse { answer, sessionId, documentId }
  },

  chatWithDocument: async (documentId, question, sessionId = null) => {
    const payload = { question };
    if (sessionId) payload.sessionId = sessionId;
    const response = await api.post(`/chat/document/${documentId}`, payload);
    return response.data?.data; // Returns ChatResponse { answer, sessionId, documentId }
  },

  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data?.data; // Returns List<ChatSessionResponse>
  },

  getSessionMessages: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data?.data; // Returns List<ChatMessageResponse>
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  }
};

export default chatService;
