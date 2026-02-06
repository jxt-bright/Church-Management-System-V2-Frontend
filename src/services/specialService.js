import api from './api';

const specialService = {
    // Save service record
    save: async (data) => {
        const res = await api.post('/specialService/save', data);
        return res.data;
    },

    // Fetch all special services of a particular church (with churchId, month)
    getAttendance: async (params) => {
        const res = await api.get('/specialService/', params)
        return res.data;
    },

    // Edit a service record
    update: async (id, data) => {
        const res = await api.put(`/specialService/${id}`, data);
        return res.data;
    },

    // Delete a service record
    delete: async (id) => {
        const res = await api.delete(`/specialService/${id}`)
        return res.data;
    }
}

export default specialService;
