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
};

export default authService;
