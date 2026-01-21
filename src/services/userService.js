import api from './api';


const userService = {
  // Function to add a new user
  addUser: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Function to fetch users
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }

};

export default userService;