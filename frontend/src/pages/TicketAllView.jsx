import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertCircle,
  CheckCircle,
  Flame,
  LoaderCircle,
  Search,
  Ticket,
} from "lucide-react";
import { ticketService } from "../services/ticketService";
import TicketDetailsModal from "../components/TicketDetailsModal";
import AdminLayout, { AdminPageHeader } from "../components/admin/AdminLayout";
import { API_BASE_URL } from "../services/api";

const CATEGORY_LABELS = {
  ELECTRICAL: "Electrical",
  PLUMBING: "Plumbing",
  HVAC: "HVAC",
  FURNITURE: "Furniture",
  EQUIPMENT: "Equipment",
  CLEANING: "Cleaning",
  SECURITY: "Security",
  IT_SUPPORT: "IT Support",
  STRUCTURAL: "Structural",
  OTHER: "Other",
};

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
      {React.createElement(Icon, { size: 22 })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
    </div>
  </div>
);

const TicketAllView = ({ userEmail }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      await response.json();
    } catch (err) {
      console.error("Failed to load admin profile", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = filterStatus === "ALL"
        ? await ticketService.getAllTickets()
        : await ticketService.getAllTicketsByStatus(filterStatus);
      setTickets(data);
    } catch (err) {
      setError("Failed to load tickets");
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
      setError("Failed to load ticket");
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 bg-red-50";
      case "HIGH":
        return "text-orange-600 bg-orange-50";
      case "MEDIUM":
        return "text-yellow-700 bg-yellow-50";
      case "LOW":
        return "text-emerald-700 bg-emerald-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-50 text-blue-700";
      case "IN_PROGRESS":
        return "bg-violet-50 text-violet-700";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700";
      case "CLOSED":
        return "bg-slate-100 text-slate-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryData = Object.values(
    tickets.reduce((acc, ticket) => {
      const label = CATEGORY_LABELS[ticket.category] || ticket.category;
      acc[label] = acc[label] || { name: label, count: 0 };
      acc[label].count += 1;
      return acc;
    }, {})
  );

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    urgent: tickets.filter((t) => t.priority === "URGENT").length,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      ticket.title?.toLowerCase().includes(query) ||
      ticket.id?.toLowerCase().includes(query) ||
      ticket.resourceName?.toLowerCase().includes(query) ||
      ticket.userName?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Tickets"
        title="Ticket Management"
        description="Monitor and manage maintenance and support tickets across campus."
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <StatCard icon={Ticket} label="Total Tickets" value={stats.total} tone="bg-sky-50 text-sky-600" />
          <StatCard icon={AlertCircle} label="Open" value={stats.open} tone="bg-blue-50 text-blue-600" />
          <StatCard icon={LoaderCircle} label="In Progress" value={stats.inProgress} tone="bg-violet-50 text-violet-600" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Flame} label="Urgent" value={stats.urgent} tone="bg-rose-50 text-rose-600" />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Tickets by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, title, resource, or user..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    filterStatus === status
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status === "IN_PROGRESS" ? "IN PROGRESS" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-slate-900">No tickets found</p>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Subject", "Category", "Status", "Priority", "Reporter", "Resource", "Technician", "Created"].map((heading) => (
                    <th key={heading} className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{ticket.title}</p>
                      <p className="max-w-[220px] truncate text-xs text-slate-500">{ticket.description}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {CATEGORY_LABELS[ticket.category] || ticket.category?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800">{ticket.userName}</td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{ticket.resourceName}</p>
                      <p className="text-xs text-slate-500">{ticket.resourceLocation}</p>
                    </td>
                    <td className="p-3">
                      {ticket.assignedToName ? (
                        <span className="font-medium text-emerald-700">{ticket.assignedToName}</span>
                      ) : (
                        <span className="font-medium text-amber-700">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        userEmail={userEmail}
        userRoles={["ROLE_ADMIN"]}
        onTicketUpdated={fetchTickets}
      />
    </AdminLayout>
  );
};

export default TicketAllView;
