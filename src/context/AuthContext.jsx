import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService.js";
import { setAuthToken } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await authService.refreshToken();

        // Restore access token (memory)
        setAuthToken(data.accessToken);

        // Restore user state

        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);

      setAuthToken(data.accessToken);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      return { success: false, message: msg };
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

