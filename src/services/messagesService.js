import api from './api';

const messagesService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations.php');
    if (response.data.success) {
      return response.data.data;
    }
