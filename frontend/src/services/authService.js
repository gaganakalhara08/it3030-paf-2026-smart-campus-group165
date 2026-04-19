import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const authService = {
  // Login with credentials
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", response.data.email);
        localStorage.setItem("userName", response.data.name);
        localStorage.setItem("userRole", response.data.role);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Register new user
  register: async (email, password, name) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        name,
      });
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // Verify token
  verifyToken: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default authService;
