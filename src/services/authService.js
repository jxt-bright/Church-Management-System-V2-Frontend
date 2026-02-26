import api from "./api.js";

const authService = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post("/auth/refreshToken");
    return res.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  requestPasswordReset: async (credentials) => {
    const res = await api.post('auth/reqResetPassword', credentials)
    return res.data;
  },

  authenticateCode: async (credentials) => {
    const res = await api.post('auth/authCode', credentials)
    return res.data;
  },

  resetPassword: async (credentials) => {
    const res = await api.post("/auth/resetPassword", credentials);
    return res.data;
  }
};

export default authService;
