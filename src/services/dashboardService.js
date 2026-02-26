import api from './api';



const dashboardService = {
  getDashboardData: async (user) => {
    try {
    const params = { status: user.status };

    if (['groupPastor', 'groupAdmin'].includes(user.status)) {
      params.target = 'group';
      params.id = user.groupId;
    } else if (['churchPastor', 'churchAdmin'].includes(user.status)) {
      params.target = 'church';
      params.id = user.churchId;
    }

    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  } catch (error) { }
  }

};

export default dashboardService;