import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { API_BASE_URL } from '../services/api';
import TicketDetailsModal from '../components/TicketDetailsModal';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const profile = await fetchUserData();
      if (!profile) return;

      await fetchAssignedTickets(profile);
    } catch (err) {
      console.error('Failed to load technician dashboard', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load technician dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch user data', err);
      throw err;
    }
  };

  const fetchAssignedTickets = async (currentUser) => {
    try {
      const allTickets = await ticketService.getAllTickets();
      const userIdString = currentUser?.id ? String(currentUser.id) : '';
      const userEmail = (currentUser?.email || '').toLowerCase();

      const assignedTickets = (allTickets || []).filter((ticket) => {
        const ticketAssignedId = ticket?.assignedToId ? String(ticket.assignedToId) : '';
        const ticketAssignedEmail = (ticket?.assignedToEmail || '').toLowerCase();
        return (
          (userIdString && ticketAssignedId === userIdString) ||
          (userEmail && ticketAssignedEmail === userEmail)
        );
      });

      setTickets(assignedTickets);
    } catch (err) {
      console.error('Failed to fetch assigned tickets', err);
      setError('Failed to load assigned tickets');
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to load ticket details');
      console.error(err);
    }
  };

  const handleTicketUpdated = () => {
    if (user) {
      fetchAssignedTickets(user);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = {
    totalAssigned: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-800 shadow-lg border-b border-purple-500">
          <div className="max-w-7xl mx-auto px-6 py-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">🛠️ Technician Dashboard</h1>
                <p className="text-purple-300 mt-1">View and manage tickets assigned to you</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{user?.name || 'Technician'}</p>
                <p className="text-purple-300 text-sm">{user?.email || ''}</p>
                <button
                  onClick={handleLogout}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800 border border-purple-500 border-opacity-30 p-6 rounded-lg">
                    <p className="text-purple-300 text-sm font-medium">Assigned Tickets</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalAssigned}</p>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-500/40 p-6 rounded-lg">
                    <p className="text-blue-300 text-sm font-medium">Open</p>
                    <p className="text-3xl font-bold text-blue-100 mt-1">{stats.open}</p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-500/40 p-6 rounded-lg">
                    <p className="text-purple-300 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold text-purple-100 mt-1">{stats.inProgress}</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-500/40 p-6 rounded-lg">
                    <p className="text-green-300 text-sm font-medium">Resolved</p>
                    <p className="text-3xl font-bold text-green-100 mt-1">{stats.resolved}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/40 rounded-lg text-red-200">
                    {error}
                  </div>
                )}

                {tickets.length === 0 ? (
                  <div className="bg-slate-800 border border-purple-500 border-opacity-30 rounded-lg p-8 text-center">
                    <p className="text-white text-lg font-medium">No assigned tickets yet</p>
                    <p className="text-purple-300 mt-1">Tickets assigned by admin will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-purple-500 border-opacity-30 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead className="bg-slate-900/60 text-purple-200">
                        <tr>
                          <th className="p-3 text-left">SUBJECT</th>
                          <th className="p-3 text-left">CATEGORY</th>
                          <th className="p-3 text-left">STATUS</th>
                          <th className="p-3 text-left">PRIORITY</th>
                          <th className="p-3 text-left">REPORTER</th>
                          <th className="p-3 text-left">RESOURCE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            onClick={() => handleViewTicket(ticket.id)}
                            className="border-t border-purple-500/20 hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <td className="p-3">
                              <p className="font-semibold text-white">{ticket.title}</p>
                              <p className="text-xs text-purple-200 truncate max-w-[240px]">{ticket.description}</p>
                            </td>
                            <td className="p-3 text-purple-100">{ticket.category?.replace('_', ' ')}</td>
                            <td className="p-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="p-3 text-purple-100">{ticket.userName}</td>
                            <td className="p-3">
                              <p className="font-medium text-white">{ticket.resourceName}</p>
                              <p className="text-xs text-purple-200">{ticket.resourceLocation}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        userEmail={user?.email}
        userRoles={['ROLE_TECHNICIAN']}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default TechnicianDashboard;