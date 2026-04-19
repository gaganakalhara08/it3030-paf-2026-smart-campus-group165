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

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'IN_PROGRESS':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'RESOLVED':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'CLOSED':
        return 'bg-gray-50 border-l-4 border-gray-500';
      case 'REJECTED':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all maintenance tickets</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total Tickets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Open</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.open}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <p className="text-purple-700 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <p className="text-green-700 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.resolved}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-700 text-sm font-medium">Urgent</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{stats.urgent}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, title, resource, or user..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600 mt-4">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">No tickets found</p>
          <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleViewTicket(ticket.id)}
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(ticket.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and ID */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryEmoji(ticket.category)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-600">ID: {ticket.id}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-3 line-clamp-2">{ticket.description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <p className="text-sm font-medium pt-1">Status :-</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(ticket.status)}`}> 
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm font-medium pt-1">Priority :-</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <p className="text-sm font-medium pt-1">Ticket Catagory :-</p>
                    <span className="inline-block px-3 py-1 rounded-full text-sm text-gray-600 bg-gray-200">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Reporter</p>
                      <p className="font-medium text-gray-900">{ticket.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Resource</p>
                      <p className="font-medium text-gray-900">{ticket.resourceName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{ticket.resourceLocation}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </div>

                  {/* Assignment and Comments */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {ticket.assignedToName ? (
                      <div className="px-3 py-1 bg-blue-100 rounded-lg text-sm text-blue-800 font-medium">
                        👤 Assigned: {ticket.assignedToName}
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-100 rounded-lg text-sm text-yellow-800 font-medium">
                        ⚠️ Unassigned
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      💬 Comments: <span className="font-semibold">{ticket.comments?.length || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      📎 Attachments: <span className="font-semibold">{ticket.attachments?.length || 0}</span>
                    </div>
                  </div>

                  {/* Rejection Reason Badge */}
                  {ticket.rejectionReason && (
                    <div className="mt-3 p-2 bg-red-100 rounded-lg border border-red-300">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Rejected:</span> {ticket.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Arrow */}
                <div className="ml-4 flex-shrink-0 text-right">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/50 text-blue-600 hover:bg-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
