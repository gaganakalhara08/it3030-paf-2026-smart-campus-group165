import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Get auth token from localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

// Create headers with authorization
const getHeaders = () => {
  return {
    Authorization: getToken(),
    'Content-Type': 'application/json',
  };
};

// ==================== TICKET ENDPOINTS ====================

export const ticketService = {
  // CREATE
  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // READ - Student/User operations
  getUserTickets: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/user/my-tickets`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserTicketsByStatus: async (status) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/user/my-tickets/status/${status}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // READ - Admin operations
  getAllTickets: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/admin/all`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllTicketsByStatus: async (status) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/admin/all/status/${status}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE - Status updates (Admin/Technician)
  updateTicketStatus: async (ticketId, statusData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/status`,
        statusData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  assignTicket: async (ticketId, userId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/assign/${userId}`,
        {},
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unassignTicket: async (ticketId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/unassign`,
        {},
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE - General updates
  updateTicket: async (ticketId, ticketData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tickets/${ticketId}`, ticketData, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE
  deleteTicket: async (ticketId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== COMMENT ENDPOINTS ====================

export const commentService = {
  // CREATE
  addComment: async (ticketId, commentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        commentData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // READ
  getTicketComments: async (ticketId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCommentById: async (ticketId, commentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/${ticketId}/comments/${commentId}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE
  updateComment: async (ticketId, commentId, commentData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/comments/${commentId}`,
        commentData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE
  deleteComment: async (ticketId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/tickets/${ticketId}/comments/${commentId}`,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
