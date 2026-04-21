import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import TicketDetailsModal from '../components/TicketDetailsModal';

const TicketAllView = ({ userEmail, userName }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoles] = useState(['ROLE_ADMIN']);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      let data;
      if (filterStatus === 'ALL') {
        data = await ticketService.getAllTickets();
      } else {
        data = await ticketService.getAllTicketsByStatus(filterStatus);
      }
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to load ticket');
      console.error(err);
    }
  };

  const handleTicketUpdated = () => {
    if (selectedTicket) {
      fetchTickets();
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

  const getStatusBadgeColor = (status) => {
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

  const getCategoryEmoji = (category) => {
    const emojis = {
      ELECTRICAL: '⚡',
      PLUMBING: '🔧',
      HVAC: '❄️',
      FURNITURE: '🪑',
      EQUIPMENT: '🖥️',
      CLEANING: '🧹',
      SECURITY: '🔐',
      IT_SUPPORT: '💻',
      STRUCTURAL: '🏗️',
      OTHER: '📋',
    };
    return emojis[category] || '📋';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    urgent: tickets.filter((t) => t.priority === 'URGENT').length,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Ticket Management</h1>
        <p className="text-purple-300 mt-1">Monitor and manage all maintenance tickets</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-purple-500 border-opacity-30">
          <p className="text-purple-300 text-sm font-medium">Total Tickets</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-500/40">
          <p className="text-blue-300 text-sm font-medium">Open</p>
          <p className="text-3xl font-bold text-blue-100 mt-1">{stats.open}</p>
        </div>
        <div className="bg-purple-900/30 p-6 rounded-lg border border-purple-500/40">
          <p className="text-purple-300 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-purple-100 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-green-900/30 p-6 rounded-lg border border-green-500/40">
          <p className="text-green-300 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-100 mt-1">{stats.resolved}</p>
        </div>
        <div className="bg-red-900/30 p-6 rounded-lg border border-red-500/40">
          <p className="text-red-300 text-sm font-medium">Urgent</p>
          <p className="text-3xl font-bold text-red-100 mt-1">{stats.urgent}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/40 rounded-lg text-red-200 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-slate-800 p-4 rounded-lg border border-purple-500 border-opacity-30 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, title, resource, or user..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 text-white border border-purple-400/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-purple-300/70"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-purple-100 hover:bg-slate-600'
                }`}
              >
                {status === 'IN_PROGRESS' ? 'IN PROGRESS' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-purple-200 mt-4">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 rounded-lg border border-purple-500/30 border-dashed">
          <svg className="w-16 h-16 mx-auto text-purple-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-purple-100 text-lg font-medium">No tickets found</p>
          <p className="text-purple-300 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg border border-purple-500/30 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-900/60 text-purple-200">
              <tr>
                {/* <th className="p-3 text-left">TICKET ID</th> */}
                <th className="p-3 text-left">SUBJECT</th>
                <th className="p-3 text-left">CATEGORY</th>
                <th className="p-3 text-left">STATUS</th>
                <th className="p-3 text-left">PRIORITY</th>
                <th className="p-3 text-left">REPORTER</th>
                <th className="p-3 text-left">RESOURCE</th>
                <th className="p-3 text-left">TECHNICIAN</th>
                <th className="p-3 text-left">CREATED</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => handleViewTicket(ticket.id)}
                  className="border-t border-purple-500/20 hover:bg-slate-700/40 cursor-pointer transition-colors"
                >
                  {/* <td className="p-3 font-medium text-blue-700">{ticket.id}</td> */}
                  <td className="p-3">
                    <p className="font-semibold text-white">{ticket.title}</p>
                    <p className="text-xs text-purple-200 truncate max-w-[220px]">
                      {ticket.description}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-700 text-purple-100">
                      <span>{getCategoryEmoji(ticket.category)}</span>
                      <span>{ticket.category.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
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
                  <td className="p-3">
                    {ticket.assignedToName ? (
                      <span className="text-blue-300 font-medium">{ticket.assignedToName}</span>
                    ) : (
                      <span className="text-yellow-300 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3 text-purple-200">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        userEmail={userEmail}
        userRoles={['ROLE_ADMIN']}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default TicketAllView;
