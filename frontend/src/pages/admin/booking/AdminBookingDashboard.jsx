import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, List, Download, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import ApprovalCard from "../../../components/booking/ApprovalCard";
import BookingFilters from "../../../components/booking/BookingFilters";
import BookingPagination from "../../../components/booking/BookingPagination";
import { API_BASE_URL } from "../../../services/api";
import AdminLayout, { AdminPageHeader } from "../../../components/admin/AdminLayout";

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

  const StatCard = ({ icon: Icon, label, value, tone }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          {React.createElement(Icon, { size: 22 })}
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
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
        activeTab === id
          ? "bg-emerald-600 text-white"
          : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      {React.createElement(Icon, {
        size: 18,
        className: activeTab === id ? "text-emerald-100" : "text-slate-400",
      })}
      <span>{label}</span>
      {badge > 0 && (
        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
          activeTab === id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Administration"
        title="Booking Management"
        description="Monitor reservations, manage approvals, and export booking records."
        actions={
          <>
              <button
                onClick={() => navigate("/admin/analytics")}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
              >
                <BarChart3 size={17} className="text-slate-400" />
                View Analytics
              </button>
              
              <button
                onClick={handleExportCSV}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Download size={17} />
                Export CSV
              </button>
          </>
        }
      />

        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={List} label="Total Bookings" value={stats.total} tone="bg-sky-50 text-sky-600" />
            <StatCard icon={Clock} label="Pending Action" value={stats.pending} tone="bg-amber-50 text-amber-600" />
            <StatCard icon={CheckCircle} label="Approved" value={stats.approved} tone="bg-emerald-50 text-emerald-600" />
            <StatCard icon={XCircle} label="Declined" value={stats.rejected} tone="bg-rose-50 text-rose-600" />
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <TabButton id="all" label="All Records" icon={List} badge={0} />
            <TabButton id="pending" label="Requires Approval" icon={Clock} badge={stats.pending} />
            <TabButton id="approved" label="Approved" icon={CheckCircle} badge={0} />
            <TabButton id="rejected" label="Declined" icon={XCircle} badge={0} />
          </div>

          {/* Filters Area */}
          {activeTab === "all" && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <p className="text-sm font-semibold text-slate-700">Filter Results</p>
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
              <p className="mt-4 text-sm font-medium text-slate-500">Loading booking data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <div className="mb-5 inline-flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <List size={42} strokeWidth={1.5} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">No records found</h3>
              <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
                No bookings match your current criteria.
              </p>
            </div>
          ) : (
            <div>
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
                <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">User Identity</th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Resource</th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{booking.userName}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.userEmail}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{booking.resourceName}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.resourceLocation}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{booking.bookingDate}</span>
                                <span className="text-sm font-medium text-slate-500">{booking.startTime} - {booking.endTime}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
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
                            <td className="px-6 py-4 text-center">
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
    </AdminLayout>
  );
};

export default AdminBookingDashboard;
