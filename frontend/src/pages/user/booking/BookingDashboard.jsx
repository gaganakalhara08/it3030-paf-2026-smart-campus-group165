import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Trash2, Edit, Eye, Plus, AlertCircle, CheckCircle, XCircle, LogOut, LayoutDashboard, Home, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import BookingsMonthCalendar from "../../../components/booking/BookingsMonthCalendar";

const BookingDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      console.log("Token from localStorage:", token ? "✓ Found" : "✗ Not found");
      
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const API_BASE_URL = "http://localhost:8080/api";
      let url = `${API_BASE_URL}/bookings/my-bookings`;
      
      if (statusFilter) {
        url = `${API_BASE_URL}/bookings/my-bookings/status/${statusFilter}`;
      }

      console.log("Fetching from:", url);
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.substring(0, 20)}...`
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Bookings data received:", data);
      setBookings(Array.isArray(data) ? data : data.content || []);
      toast.success(`Loaded ${Array.isArray(data) ? data.length : (data.content || []).length} bookings`);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(`Failed to load bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/bookings/${bookingId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to delete booking");
        
        fetchBookings();
        toast.success("Booking deleted successfully!");
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking");
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/bookings/${bookingId}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to cancel booking");
        
        fetchBookings();
        toast.success("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Calculate booking statistics
  const calculateStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === "PENDING").length,
      approved: bookings.filter(b => b.status === "APPROVED").length,
      rejected: bookings.filter(b => b.status === "REJECTED").length,
    };
  };

  const stats = calculateStats();
  const shownBookings = dateFilter
    ? bookings.filter((b) => (b.bookingDate || "").slice(0, 10) === dateFilter)
    : bookings;

  const StatCard = ({ icon: Icon, label, count, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 flex items-center gap-4 shadow-md hover:shadow-lg transition-all`}>
      <div className={`${color} p-4 rounded-full`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-gray-800">{count}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Smart Campus Portal</h1>
            <p className="text-gray-600 text-sm mt-1">Manage all your campus resources and requests</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <Home size={16} />
              User Dashboard
            </button>
            <button
              onClick={() => navigate("/user/bookings/dashboard")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <LayoutDashboard size={16} />
              Booking Dashboard
            </button>
            <button
              onClick={() => navigate("/user/bookings/create")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <Plus size={16} />
              Create Booking
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Booking Dashboard Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bookings</h2>
            <p className="text-gray-600">Manage and track all your resource bookings</p>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              count={stats.total}
              color="bg-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={AlertCircle}
              label="Pending"
              count={stats.pending}
              color="bg-yellow-600"
              bgColor="bg-yellow-50"
            />
            <StatCard
              icon={CheckCircle}
              label="Approved"
              count={stats.approved}
              color="bg-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={XCircle}
              label="Rejected"
              count={stats.rejected}
              color="bg-red-600"
              bgColor="bg-red-50"
            />
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === ""
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === "PENDING"
                  ? "bg-yellow-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-yellow-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === "APPROVED"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-green-600"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === "REJECTED"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-red-600"
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Calendar Filter */}
          <div className="mb-6">
            <BookingsMonthCalendar
              bookings={bookings}
              selectedDate={dateFilter}
              onSelectDate={setDateFilter}
            />
          </div>

          {/* Bookings Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : shownBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500 mb-6">
                {dateFilter
                  ? `No bookings on ${dateFilter}.`
                  : statusFilter
                    ? "No bookings match this filter. "
                    : "Create your first booking to get started. "}
              </p>
              <button
                onClick={() => navigate("/user/bookings/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
              >
                Create Booking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shownBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {booking.resourceName}
                      </h3>
                      <p className="text-sm text-gray-500">{booking.resourceType}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      booking.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      booking.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-gray-700 text-sm flex-grow">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                      <span className="truncate">{booking.resourceLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                      {booking.bookingDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-600 flex-shrink-0" />
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    <span className="font-semibold">Purpose:</span> {booking.purpose}
                  </p>

                  <div className="flex gap-2 mt-auto flex-wrap">
                    <button
                      onClick={() => navigate(`/user/bookings/${booking.id}`)}
                      className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded transition-all text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => navigate(`/user/bookings/${booking.id}`)}
                        className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded transition-all text-sm font-medium"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    )}
                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => navigate(`/user/bookings/${booking.id}/check-in`)}
                        className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 py-2 rounded transition-all text-sm font-medium"
                      >
                        <QrCode size={16} />
                        Check-In
                      </button>
                    )}
                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded transition-all text-sm font-medium"
                        title="Cancel booking"
                      >
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    )}
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded transition-all text-sm font-medium"
                        title="Delete booking"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                    {booking.status === "REJECTED" && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="flex-1 min-w-16 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded transition-all text-sm font-medium"
                        title="Delete booking"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;
