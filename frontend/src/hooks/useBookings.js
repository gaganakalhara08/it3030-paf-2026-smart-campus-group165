import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders } from '../services/api';
import toast from 'react-hot-toast';

export const useBookings = (endpoint = '/bookings/my-bookings') => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const fetchBookings = useCallback(async (page = 0, size = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}${endpoint}?page=${page}&size=${size}`;

      // Add filters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      const content = Array.isArray(data) ? data : data.content || [];

      setBookings(content);
      setPagination({
        page,
        size,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || content.length,
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const approveBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to approve booking');

      toast.success('Booking approved successfully!');
      await fetchBookings(pagination.page, pagination.size);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, fetchBookings]);

  const rejectBooking = useCallback(async (bookingId, reason) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      toast.success('Booking rejected successfully!');
      await fetchBookings(pagination.page, pagination.size);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, fetchBookings]);

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast.success('Booking cancelled successfully!');
      await fetchBookings(pagination.page, pagination.size);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, fetchBookings]);

  const deleteBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      toast.success('Booking deleted successfully!');
      await fetchBookings(pagination.page, pagination.size);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    approveBooking,
    rejectBooking,
    cancelBooking,
    deleteBooking,
  };
};

export const useBookingStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    currentMonth: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/admin/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};
