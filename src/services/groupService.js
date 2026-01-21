import api from './api';



const groupService = {
  // Function to add a new group
  addGroup: async (groupData) => {
    const response = await api.post('/groups/register', groupData);
    return response.data;
  },

  // Function to fetch all groups
  getGroups: async (params) => {
    const response = await api.get('/groups', { params: params });
    return response.data;
  },

  // Function to fetch a single group with ID
  getGroupById: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // Function to update a single group
  updateGroup: async (id, groupData) => {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  },

  // Delete a group route
  deleteGroup: async (groupId) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  }

};

export default groupService;