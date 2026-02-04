import api from './api.js';

const attendanceService = {
    save: async (data) => {
        const res = await api.post('/attendance/save', data);
        return res.data;
    },

    // Fetch all attendance of a particular church for only the month that the calendar is showing
    getAttendance: async (params) => {
        const res = await api.get('/attendance/', params)
        return res.data;
    },

    // Edit an attendance record
    update: async (id, data) => {
        const res = await api.put(`/attendance/${id}`, data);
        return res.data;
    },

    // Delete attendance
    delete: async ( id ) => {
        const res = await api.delete(`/attendance/${id}`)
        return res.data;
    }
}

export default attendanceService;