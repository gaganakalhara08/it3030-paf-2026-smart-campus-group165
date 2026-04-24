import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../services/api";
import QRCodeDisplay from "../../../components/booking/QRCodeDisplay";
import UserLayout from "../../../components/user/UserLayout";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

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

  async function fetchBookingDetails() {
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
          Authorization: `Bearer ${token}`,
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
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookingDetails();
  }, [id]);

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
      const attendeesNum = parseInt(editFormData.expectedAttendees, 10);

      if (purposeTrimmed.length < 5) {
        toast.error("Purpose must be at least 5 characters");
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resourceId: booking.resourceId,
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
      closeEditModal();
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      toast.success("Booking deleted successfully!", { id: toastId });
      setTimeout(() => navigate("/user/bookings/dashboard"), 1000);
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
          Authorization: `Bearer ${token}`,
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

  const statusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
      CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[status] || "bg-cyan-100 text-cyan-700 border-cyan-200";
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      </UserLayout>
    );
  }

  if (!booking) {
    return (
      <UserLayout contentClassName="max-w-2xl">
          <button
            onClick={() => navigate("/user/bookings/dashboard")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-rose-400" />
            <h3 className="text-xl font-semibold text-slate-700">Booking not found</h3>
            <p className="mt-2 text-slate-500">The booking you are looking for does not exist.</p>
          </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout contentClassName="max-w-6xl">
      <div>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/user/bookings/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex-1" />

          <div className={`rounded-full border px-4 py-2 text-sm font-bold ${statusBadge(booking.status)}`}>
            {booking.status}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {booking.resourceName}
              </p>
              <p className="mt-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                {booking.resourceType}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <MapPin size={16} className="text-cyan-600" />
                    Location
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{booking.resourceLocation}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Users size={16} className="text-cyan-600" />
                    Capacity
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{booking.capacity} people</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Calendar size={16} className="text-cyan-600" />
                    Booking Date
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{booking.bookingDate}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Clock size={16} className="text-cyan-600" />
                    Time Slot
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Users size={16} className="text-cyan-600" />
                    Expected Attendees
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{booking.expectedAttendees} people</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Calendar size={16} className="text-cyan-600" />
                    Created On
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-bold text-slate-800">Purpose</p>
              <div className="mt-3 flex gap-3">
                <FileText size={18} className="mt-1 text-cyan-600" />
                <p className="leading-relaxed text-slate-700">{booking.purpose}</p>
              </div>
            </div>

            {booking.status === "REJECTED" && booking.adminReason && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                <p className="text-lg font-bold text-rose-800">Rejection Reason</p>
                <div className="mt-3 flex gap-3">
                  <AlertCircle size={18} className="mt-1 text-rose-600" />
                  <p className="text-rose-700">{booking.adminReason}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-bold text-slate-900">Booked By</p>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 font-bold text-white">
                  {booking.userName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{booking.userName}</p>
                  <p className="text-sm font-medium text-slate-700">{booking.userEmail}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-3">
                {booking.status === "PENDING" && (
                  <button
                    onClick={openEditModal}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-700"
                  >
                    <Edit size={16} />
                    Edit Booking
                  </button>
                )}

                {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={actionLoading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={16} />
                    {actionLoading ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}

                {booking.status === "REJECTED" && (
                  <button
                    onClick={handleDeleteBooking}
                    disabled={actionLoading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {actionLoading ? "Deleting..." : "Delete Booking"}
                  </button>
                )}

                <button
                  onClick={() => navigate("/user/bookings/dashboard")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <QRCodeDisplay
              qrValue={`${window.location.origin}/user/bookings/${booking.id}/check-in`}
              bookingId={booking.id}
            />
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <p className="text-xl font-bold text-slate-800">Edit Booking</p>
              <button
                onClick={closeEditModal}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purpose of Booking <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={editFormData.purpose}
                  onChange={handleEditInputChange}
                  placeholder="Describe the purpose of your booking..."
                  rows="4"
                  minLength="5"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
                {editFormData.purpose && (
                  <p className={`mt-2 text-xs ${editFormData.purpose.length < 5 ? "text-rose-500" : "text-emerald-600"}`}>
                    {editFormData.purpose.length}/5 minimum characters
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Expected Attendees <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={editFormData.expectedAttendees}
                  onChange={handleEditInputChange}
                  min="1"
                  max={booking?.capacity}
                  placeholder="Number of people"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
                {editFormData.expectedAttendees && (
                  <p className="mt-2 text-xs text-slate-500">
                    {editFormData.expectedAttendees} / {booking?.capacity} capacity
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default BookingDetails;
