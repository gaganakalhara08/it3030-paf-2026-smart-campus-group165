import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Trash2, Edit, Eye, Plus, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const API_BASE_URL = "http://localhost:8080/api";
      let url = `${API_BASE_URL}/bookings/my-bookings`;
      
      if (statusFilter) {
        url = `${API_BASE_URL}/bookings/my-bookings/status/${statusFilter}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch bookings");
      }
      
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-gray-600 mt-2">Manage your resource bookings</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/user/bookings/create")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Plus size={20} />
              New Booking
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === ""
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === "PENDING"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === "APPROVED"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first booking to get started
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
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {booking.resourceName}
                    </h3>
                    <p className="text-sm text-gray-500">{booking.resourceType}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    booking.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    booking.status === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {booking.resourceLocation}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    {booking.bookingDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  <span className="font-semibold">Purpose:</span> {booking.purpose}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/user/bookings/${booking.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded transition-all text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => navigate(`/user/bookings/${booking.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded transition-all text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                  {(booking.status === "APPROVED" || booking.status === "PENDING") && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded transition-all text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {(booking.status === "PENDING" || booking.status === "REJECTED") && (
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded transition-all text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;