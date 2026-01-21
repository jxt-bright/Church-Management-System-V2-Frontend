import api from './api';


const churchService = {
  // Function to add a new churches
  addChurch: async (churchData) => {
    const response = await api.post('/churches/register', churchData);
    return response.data;
  },

  // Function to fetch all churches
  getChurches: async (params) => {
    const response = await api.get('/churches', { params: params });
    return response.data;
  },

  // Function to fetch a single church with ID
  getChurchById: async (id) => {
    const response = await api.get(`/churches/${id}`);
    return response.data;
  },

  // Send updated data to backend
  updateChurch: async (id, churchData) => {
    const response = await api.put(`/churches/${id}`, churchData);
    return response.data;
  },

  deleteChurch: async (churchId) => {
    const response = await api.delete(`/churches/${churchId}`);
    return response.data;
  }

};

export default churchService;