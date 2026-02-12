import api from "./api";



const messageService = {
  // Function to send message
  send: async (params) => {
    const response = await api.post('/messages/send', params);
    return response.data;
  }
};

export default messageService;