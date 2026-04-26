import React, { useEffect, useState } from "react";
import { LifeBuoy, Plus, Search } from "lucide-react";
import { ticketService } from "../services/ticketService";
import TicketDetailsModal from "../components/TicketDetailsModal";
import CreateTicketModal from "../components/CreateTicketModal";
import UserLayout from "../components/user/UserLayout";

const categories = ["ALL", "ACADEMIC", "IT_SUPPORT", "ELECTRICAL", "PLUMBING", "CLEANING", "SECURITY", "OTHER"];

const TicketStudentView = ({ userEmail }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  async function fetchTickets() {
    try {
      setLoading(true);
      const data = await ticketService.getUserTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let data = [...tickets];

    if (statusFilter !== "ALL") data = data.filter((ticket) => ticket.status === statusFilter);
    if (categoryFilter !== "ALL") data = data.filter((ticket) => ticket.category === categoryFilter);
    if (search) {
      const query = search.toLowerCase();
      data = data.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(query) ||
          ticket.description?.toLowerCase().includes(query) ||
          ticket.id?.toString().includes(query)
      );
    }

    setFilteredTickets(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyFilters();
  }, [search, statusFilter, categoryFilter, tickets]);

  const handleView = async (id) => {
    const ticket = await ticketService.getTicketById(id);
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const total = tickets.length;
  const active = tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "border-sky-200 bg-sky-50 text-sky-700";
      case "IN_PROGRESS":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "RESOLVED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const stats = [
    { label: "Total", value: total },
    { label: "Active", value: active },
    { label: "Resolved", value: resolved },
  ];

  return (
    <UserLayout
      headerActions={
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={16} />
          New Ticket
        </button>
      }
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">{item.value}</h2>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "All Categories" : category.replace("_", " ")}
                </option>
              ))}
            </select>

            <select
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mb-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mb-4 h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <LifeBuoy size={34} className="mx-auto mb-3 text-slate-400" />
            <p className="font-semibold text-slate-700">No tickets found</p>
            <p className="mt-1 text-sm text-slate-500">Try changing your filters or create a new ticket.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <button
                type="button"
                key={ticket.id}
                onClick={() => handleView(ticket.id)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{ticket.title}</h3>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status?.replace("_", " ")}
                  </span>
                </div>

                <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-500">
                  {ticket.description || "No description provided."}
                </p>

                <div className="flex justify-between text-xs font-medium text-slate-400">
                  {/* <span>#{ticket.id}</span> */}
                  <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        onTicketUpdated={fetchTickets}
      />

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={fetchTickets}
      />
    </UserLayout>
  );
};

export default TicketStudentView;
