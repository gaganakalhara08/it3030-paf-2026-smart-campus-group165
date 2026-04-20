import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import TicketDetailsModal from '../components/TicketDetailsModal';
import CreateTicketModal from '../components/CreateTicketModal';

const TicketStudentView = ({ userEmail }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, statusFilter, categoryFilter, tickets]);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getUserTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...tickets];

    if (statusFilter !== 'ALL') {
      data = data.filter(t => t.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      data = data.filter(t => t.category === categoryFilter);
    }

    if (search) {
      data = data.filter(
        t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toString().includes(search)
      );
    }

    setFilteredTickets(data);
  };

  const handleView = async (id) => {
    const ticket = await ticketService.getTicketById(id);
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // 📊 Summary Data
  const total = tickets.length;
  const active = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN':
        return 'text-blue-600';
      case 'IN_PROGRESS':
        return 'text-orange-500';
      case 'RESOLVED':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'ACADEMIC':
        return 'bg-blue-100 text-blue-600';
      case 'IT':
        return 'bg-gray-200 text-gray-700';
      case 'FINANCE':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support & Assistance</h1>
          <p className="text-gray-600 text-sm">
            Submit new inquiries or track existing support requests
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          + Raise New Ticket
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">TOTAL TICKETS</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">ACTIVE NOW</p>
          <h2 className="text-2xl font-bold">{active}</h2>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">RESOLVED</p>
          <h2 className="text-2xl font-bold">{resolved}</h2>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search ticket ID or subject..."
          className="flex-1 p-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded-lg"
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="ACADEMIC">Academic</option>
          <option value="IT">IT</option>
          <option value="FINANCE">Finance</option>
        </select>

        <select
          className="p-2 border rounded-lg"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {/* <th className="p-3 text-left">TICKET ID</th> */}
              <th className="p-3 text-left">SUBJECT</th>
              <th className="p-3 text-left">CATEGORY</th>
              <th className="p-3 text-left">STATUS</th>
              <th className="p-3 text-left">LAST UPDATE</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map(ticket => (
              <tr
                key={ticket.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => handleView(ticket.id)}
              >
                {/* <td className="p-3 text-blue-600 font-semibold">
                  #{ticket.id}
                </td> */}

                <td className="p-3">
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-gray-500 text-xs">
                    {ticket.description?.slice(0, 40)}...
                  </p>
                </td>

                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryStyle(ticket.category)}`}>
                    {ticket.category}
                  </span>
                </td>

                <td className={`p-3 font-medium ${getStatusStyle(ticket.status)}`}>
                  ● {ticket.status.replace('_', ' ')}
                </td>

                <td className="p-3 text-gray-500">
                  {formatDate(ticket.updatedAt || ticket.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <p className="text-center py-6 text-gray-500">No tickets found</p>
        )}
      </div>

      {/* Modals */}
      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
      />

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={fetchTickets}
      />
    </div>
  );
};

export default TicketStudentView;