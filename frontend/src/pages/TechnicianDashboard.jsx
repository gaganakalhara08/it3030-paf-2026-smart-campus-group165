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

  // UPDATED COLORS
  const getStatusColor = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    totalAssigned: tickets.length,
    closed: tickets.filter((t) => t.status === 'CLOSED').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6 w-full flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Technician Dashboard</h1>
              <p className="text-gray-500 text-sm">View and manage assigned tickets</p>
            </div>

            <div className="text-right">
              <p className="text-gray-800 font-semibold">{user?.name || 'Technician'}</p>
              <p className="text-gray-500 text-sm">{user?.email || ''}</p>
              <button
                onClick={handleLogout}
                className="mt-2 px-3 py-1.5 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12"></div>
              </div>
            ) : (
              <>
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm">Assigned Tickets</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalAssigned}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-blue-500 text-sm">Closed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.closed}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-purple-500 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm ">
                    <p className="text-green-500 text-sm">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-600">
                    {error}
                  </div>
                )}

                {/* TABLE */}
                {tickets.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-700 font-medium">No assigned tickets yet</p>
                    <p className="text-gray-500 mt-1 text-sm">
                      Tickets assigned by admin will appear here
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl overflow-x-auto">

                    <table className="w-full min-w-[900px] text-sm">
                      <thead className="bg-gray-50 text-gray-600">
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
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="p-3">
                              <p className="font-semibold text-gray-800">{ticket.title}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[240px]">
                                {ticket.description}
                              </p>
                            </td>

                            <td className="p-3 text-gray-600">
                              {ticket.category?.replace('_', ' ')}
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </td>

                            <td className="p-3 text-gray-600">{ticket.userName}</td>

                            <td className="p-3">
                              <p className="font-medium text-gray-800">{ticket.resourceName}</p>
                              <p className="text-xs text-gray-500">{ticket.resourceLocation}</p>
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