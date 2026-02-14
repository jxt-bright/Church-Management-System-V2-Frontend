import api from "./api";



const reportService = {

  monthlyReport: async (params) => {
    const response = await api.get('/reports/monthly', { params });
    return response.data.report;
  },

  generalReport: async (params) => {
    const response = await api.get('/reports/general', { params });
    return response.data.report;
  }
};

export default reportService;