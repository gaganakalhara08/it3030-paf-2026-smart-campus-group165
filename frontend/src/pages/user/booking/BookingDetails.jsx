import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Edit, Trash2, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../services/api";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    purpose: "",
    expectedAttendees: "",
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch booking details");
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (!booking) return;
    setEditFormData({
      purpose: booking.purpose || "",
      expectedAttendees: booking.expectedAttendees || "",
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditFormData({
      purpose: "",
      expectedAttendees: "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const purposeTrimmed = editFormData.purpose.trim();
      const attendeesNum = parseInt(editFormData.expectedAttendees);

      if (purposeTrimmed.length < 10) {
        toast.error("Purpose must be at least 10 characters");
        setActionLoading(false);
        return;
      }

      if (attendeesNum > booking.capacity) {
        toast.error(`Expected attendees cannot exceed room capacity of ${booking.capacity}`);
        setActionLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/login");
        setActionLoading(false);
        return;
      }

      const toastId = toast.loading("Updating booking...");

      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          resourceId: booking.resourceId,
          resourceName: booking.resourceName,
          resourceType: booking.resourceType,
          resourceLocation: booking.resourceLocation,
          capacity: booking.capacity,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: purposeTrimmed,
          expectedAttendees: attendeesNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update booking");
      }

      toast.success("Booking updated successfully!", { id: toastId });
      setEditModalOpen(false);
      setEditFormData({
        purpose: "",
        expectedAttendees: "",
      });
      await fetchBookingDetails();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this booking? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionLoading(true);
    const toastId = toast.loading("Deleting booking...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.", { id: toastId });
        navigate("/login");
        setActionLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      toast.success("Booking deleted successfully!", { id: toastId });
      setTimeout(() => {
        navigate("/user/bookings");
      }, 1000);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error(error.message || "Failed to delete booking", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionLoading(true);
    const toastId = toast.loading("Cancelling booking...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.", { id: toastId });
        navigate("/login");
        setActionLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel booking");

      toast.success("Booking cancelled successfully!", { id: toastId });
      await fetchBookingDetails();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-50 border-yellow-200 text-yellow-800",
      APPROVED: "bg-green-50 border-green-200 text-green-800",
      REJECTED: "bg-red-50 border-red-200 text-red-800",
      CANCELLED: "bg-gray-50 border-gray-200 text-gray-800",
    };
    return colors[status] || "bg-blue-50 border-blue-200 text-blue-800";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-blue-100 text-blue-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/user/bookings")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Bookings
          </button>
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Booking not found</h3>
            <p className="text-gray-500 mt-2">The booking you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/user/bookings")}
            className="p-2 hover:bg-white rounded-lg transition-all"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">Booking Details</h1>
            <p className="text-gray-600">Booking ID: {booking.id}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full font-semibold ${getStatusBadgeColor(
              booking.status
            )}`}
          >
            {booking.status}
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${getStatusColor(
            booking.status
          )}`}
        >
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {booking.resourceName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {booking.resourceLocation}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {booking.capacity} people
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-b-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {booking.bookingDate}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Expected Attendees</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {booking.expectedAttendees} people
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-b-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Purpose</h3>
            <div className="flex gap-3">
              <FileText size={20} className="text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700 leading-relaxed">{booking.purpose}</p>
            </div>
          </div>

          {booking.status === "REJECTED" && booking.adminReason && (
            <div className="p-8 border-b-2 border-red-100 bg-red-50">
              <h3 className="text-lg font-bold text-red-800 mb-3">
                Rejection Reason
              </h3>
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 mt-1 flex-shrink-0" />
                <p className="text-red-800">{booking.adminReason}</p>
              </div>
            </div>
          )}

          <div className="p-8 border-b-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Booked By</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {booking.userName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {booking.userName}
                </p>
                <p className="text-gray-600">{booking.userEmail}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex gap-4 flex-wrap">
            {booking.status === "PENDING" && (
              <button
                onClick={openEditModal}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <Edit size={18} />
                Edit Booking
              </button>
            )}

            {(booking.status === "PENDING" || booking.status === "APPROVED") && (
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
                {actionLoading ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}

            {booking.status === "REJECTED" && (
              <button
                onClick={handleDeleteBooking}
                disabled={actionLoading}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                {actionLoading ? "Deleting..." : "Delete Booking"}
              </button>
            )}

            <button
              onClick={() => navigate("/user/bookings")}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Edit Booking</h2>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose of Booking{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Minimum 10 characters)
                  </span>
                </label>
                <textarea
                  name="purpose"
                  value={editFormData.purpose}
                  onChange={handleEditInputChange}
                  placeholder="Describe the purpose of your booking..."
                  rows="4"
                  minLength="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  required
                />
                {editFormData.purpose && (
                  <p
                    className={`text-xs mt-2 ${
                      editFormData.purpose.length < 10
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {editFormData.purpose.length}/10 minimum characters
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Attendees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={editFormData.expectedAttendees}
                  onChange={handleEditInputChange}
                  min="1"
                  max={booking?.capacity}
                  placeholder="Number of people"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {editFormData.expectedAttendees && (
                  <p className="text-xs text-gray-500 mt-2">
                    {editFormData.expectedAttendees} / {booking?.capacity} capacity
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Updating..." : "Update Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;