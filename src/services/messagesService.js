import api from './api';

const messagesService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations.php');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  },

  getHistory: async (userId) => {
    const response = await api.get(`/messages/history.php?user_id=${userId}`);
    if (response.data.success) {
      return response.data.data;
    }
