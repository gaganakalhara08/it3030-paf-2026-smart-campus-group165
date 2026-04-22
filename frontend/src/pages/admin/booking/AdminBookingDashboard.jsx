import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, List, Download, BarChart3, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import ApprovalCard from "../../../components/booking/ApprovalCard";
import BookingFilters from "../../../components/booking/BookingFilters";
import BookingPagination from "../../../components/booking/BookingPagination";
import { API_BASE_URL } from "../../../services/api";
import AdminSidebar from "../../../components/admin/AdminSidebar";

const AdminBookingDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, [activeTab, currentPage, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin/all?page=0&size=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      const content = data.content || [];

      setStats({
        total: data.totalElements || 0,
        pending: content.filter((b) => b.status === "PENDING").length,
        approved: content.filter((b) => b.status === "APPROVED").length,
        rejected: content.filter((b) => b.status === "REJECTED").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/bookings/admin/all?page=${currentPage}&size=${pageSize}`;

      if (activeTab === "pending") url += "&status=PENDING";
      else if (activeTab === "approved") url += "&status=APPROVED";
      else if (activeTab === "rejected") url += "&status=REJECTED";

      if (statusFilter && activeTab === "all") url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    const toastId = toast.loading("Approving booking...");
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to approve booking");

      toast.success("Booking approved successfully!", { id: toastId });
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error approving booking:", error);
      toast.error("Failed to approve booking", { id: toastId });
    }
  };

  const handleReject = async (bookingId, reason) => {
    const toastId = toast.loading("Rejecting booking...");
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error("Failed to reject booking");

      toast.success("Booking rejected successfully!", { id: toastId });
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject booking", { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleExportCSV = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const headers = ["ID,User,Email,Resource,Location,Date,Start Time,End Time,Status,Attendees,Purpose"];
    
    const rows = bookings.map((b) => {
      const purpose = b.purpose ? `"${b.purpose.replace(/"/g, '""')}"` : '""';
      const resource = b.resourceName ? `"${b.resourceName.replace(/"/g, '""')}"` : '""';
      const location = b.resourceLocation ? `"${b.resourceLocation.replace(/"/g, '""')}"` : '""';
      const user = b.userName ? `"${b.userName.replace(/"/g, '""')}"` : '""';
      
      return `${b.id},${user},${b.userEmail},${resource},${location},${b.bookingDate},${b.startTime},${b.endTime},${b.status},${b.expectedAttendees},${purpose}`;
    });

    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings exported successfully!");
  };

  const StatCard = ({ icon: Icon, label, value, gradient, shadow }) => (
    <div className={`relative overflow-hidden rounded-3xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${shadow} border border-slate-100`}>
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 bg-gradient-to-br ${gradient}`}></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-black text-slate-800">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, badge }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setCurrentPage(0);
      }}
      className={`group relative flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-bold transition-all duration-300 ${
        activeTab === id
          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200"
          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      <Icon size={20} className={activeTab === id ? "text-indigo-100" : "text-slate-400 group-hover:text-indigo-500"} />
      <span>{label}</span>
      {badge > 0 && (
        <span className={`ml-2 flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-black shadow-sm ${
          activeTab === id ? "bg-white/20 text-white" : "bg-rose-500 text-white shadow-rose-200"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative">
        {/* Background abstract decoration */}
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-transparent -z-10 blur-3xl pointer-events-none"></div>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto mt-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold tracking-wide">
                <LayoutGrid size={16} />
                ADMINISTRATION OVERSIGHT
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                Booking Management
              </h1>
              <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">
                Monitor facility reservations, orchestrate approvals, and export comprehensive audit reports instantly.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("/admin/analytics")}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:text-indigo-600"
              >
                <BarChart3 size={18} className="text-slate-400 group-hover:text-indigo-500" />
                View Analytics
              </button>
              
              <button
                onClick={handleExportCSV}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <Download size={18} className="text-slate-300" />
                Export CSV Report
              </button>
            </div>
          </div>

          {/* Premium Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={List} label="Total Bookings" value={stats.total} gradient="from-blue-500 to-indigo-600" shadow="shadow-xl shadow-indigo-100/50" />
            <StatCard icon={Clock} label="Pending Action" value={stats.pending} gradient="from-amber-400 to-orange-500" shadow="shadow-xl shadow-orange-100/50" />
            <StatCard icon={CheckCircle} label="Approved" value={stats.approved} gradient="from-emerald-400 to-teal-500" shadow="shadow-xl shadow-teal-100/50" />
            <StatCard icon={XCircle} label="Declined" value={stats.rejected} gradient="from-rose-500 to-pink-600" shadow="shadow-xl shadow-rose-100/50" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <TabButton id="all" label="All Records" icon={List} badge={0} />
            <TabButton id="pending" label="Requires Approval" icon={Clock} badge={stats.pending} />
            <TabButton id="approved" label="Approved" icon={CheckCircle} badge={0} />
            <TabButton id="rejected" label="Declined" icon={XCircle} badge={0} />
          </div>

          {/* Filters Area */}
          {activeTab === "all" && (
            <div className="mb-8 overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm transition-all">
              <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Filter Results</p>
              </div>
              <div className="p-6">
                <BookingFilters
                  statusFilter={statusFilter}
                  onStatusChange={(status) => {
                    setStatusFilter(status);
                    setCurrentPage(0);
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Bookings Display */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white/50 rounded-3xl border border-slate-100">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-indigo-400 opacity-20"></div>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              </div>
              <p className="mt-6 text-slate-500 font-medium animate-pulse">Loading secure booking data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-slate-200">
              <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-100 mb-6 relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full"></div>
                <List size={48} strokeWidth={1} className="text-slate-400 relative z-10" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800">No records found</h3>
              <p className="text-slate-500 mt-3 text-lg font-medium max-w-md mx-auto text-center">
                No bookings match your current criteria. You're completely caught up!
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "pending" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                  {bookings.map((booking) => (
                    <ApprovalCard
                      key={booking.id}
                      booking={booking}
                      onApprove={() => handleApprove(booking.id)}
                      onReject={(reason) => handleReject(booking.id, reason)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-10 ring-1 ring-slate-900/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Resource</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{booking.userName}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.userEmail}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{booking.resourceName}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.resourceLocation}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{booking.bookingDate}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.startTime} - {booking.endTime}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                                booking.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                booking.status === "REJECTED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                booking.status === "CANCELLED" ? "bg-slate-50 text-slate-600 border-slate-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                {booking.status === "APPROVED" && <CheckCircle size={14} className="text-emerald-500" />}
                                {booking.status === "REJECTED" && <XCircle size={14} className="text-rose-500" />}
                                {booking.status === "PENDING" && <Clock size={14} className="text-amber-500" />}
                                {booking.status}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm border border-slate-200 shadow-sm">
                                {booking.expectedAttendees}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center pb-8 pt-4">
                  <BookingPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDashboard;