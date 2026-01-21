import api from './api';


const memberService = {
  // Function to add a new member
  addMember: async (memberData) => {
    const response = await api.post('/members/register', memberData);
    return response.data;
  },

  // Function to fetch members
  getMembers: async (params) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  // Function to fetch member by ID
  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Update member
  updateMember: async (id, data) => {
    const response = await api.put(`/members/edit/${id}`, data);
    return response.data;
  },

  deleteMember: async (memberId) => {
    const response = await api.delete(`/members/${memberId}`);
    return response.data;
  }

};

export default memberService;