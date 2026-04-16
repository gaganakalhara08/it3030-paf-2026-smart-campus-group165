import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, List } from "lucide-react";
import toast from "react-hot-toast";
import ApprovalCard from "../../../components/booking/ApprovalCard";
import BookingFilters from "../../../components/booking/BookingFilters";
import BookingPagination from "../../../components/booking/BookingPagination";
import { API_BASE_URL } from "../../../services/api";

const AdminBookingDashboard = () => {
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

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, badge }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setCurrentPage(0);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{badge}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage all bookings and approve/reject requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={List} label="Total Bookings" value={stats.total} color="bg-blue-600" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-yellow-600" />
          <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-green-600" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-600" />
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <TabButton id="all" label="All Bookings" icon={List} badge={0} />
          <TabButton id="pending" label="Pending Approvals" icon={Clock} badge={stats.pending} />
          <TabButton id="approved" label="Approved" icon={CheckCircle} badge={0} />
          <TabButton id="rejected" label="Rejected" icon={XCircle} badge={0} />
        </div>

        {activeTab === "all" && (
          <div className="mb-6">
            <BookingFilters statusFilter={statusFilter} onStatusChange={(status) => {
              setStatusFilter(status);
              setCurrentPage(0);
            }} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No bookings found</h3>
            <p className="text-gray-500 mt-2">There are no bookings in this category yet.</p>
          </div>
        ) : (
          <>
            {activeTab === "pending" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Resource</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Attendees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-all">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">{booking.userName}</p>
                              <p className="text-sm text-gray-500">{booking.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">{booking.resourceName}</p>
                              <p className="text-sm text-gray-500">{booking.resourceLocation}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">{booking.bookingDate}</p>
                              <p className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "APPROVED" ? "bg-green-100 text-green-800" :
                              booking.status === "REJECTED" ? "bg-red-100 text-red-800" :
                              booking.status === "CANCELLED" ? "bg-gray-100 text-gray-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-800">{booking.expectedAttendees}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <BookingPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBookingDashboard;