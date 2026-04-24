import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Edit,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import BookingsMonthCalendar from "../../../components/booking/BookingsMonthCalendar";
import UserLayout from "../../../components/user/UserLayout";

const StatCard = ({ icon, label, count, tint }) => {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-800">{count}</h3>
        </div>
        <div className={`rounded-xl p-3 ${tint}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
};

const BookingDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  async function fetchBookings() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("Token from localStorage:", token ? "Found" : "Not found");

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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const bookingList = Array.isArray(data) ? data : data.content || [];
      setBookings(bookingList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(`Failed to load bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [statusFilter]);

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to cancel booking");

        fetchBookings();
        toast.success("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking");
      }
    }
  };

  const calculateStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
      approved: bookings.filter((booking) => booking.status === "APPROVED").length,
      rejected: bookings.filter((booking) => booking.status === "REJECTED").length,
    };
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "CANCELLED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const stats = calculateStats();
  const shownBookings = dateFilter
    ? bookings.filter((booking) => (booking.bookingDate || "").slice(0, 10) === dateFilter)
    : bookings;

  const filterButtons = [
    { key: "", label: "All", style: "bg-cyan-600 text-white border-cyan-600" },
    { key: "PENDING", label: "Pending", style: "bg-amber-500 text-white border-amber-500" },
    { key: "APPROVED", label: "Approved", style: "bg-emerald-600 text-white border-emerald-600" },
    { key: "REJECTED", label: "Rejected", style: "bg-rose-600 text-white border-rose-600" },
  ];

  return (
    <UserLayout
      headerActions={
        <button
          type="button"
          onClick={() => navigate("/user/bookings/create")}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={16} />
          Create Booking
        </button>
      }
    >
          <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Calendar} label="Total Bookings" count={stats.total} tint="bg-cyan-600" />
            <StatCard icon={AlertCircle} label="Pending" count={stats.pending} tint="bg-amber-500" />
            <StatCard icon={CheckCircle} label="Approved" count={stats.approved} tint="bg-emerald-600" />
            <StatCard icon={XCircle} label="Rejected" count={stats.rejected} tint="bg-rose-600" />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((button) => {
                const active = statusFilter === button.key;
                return (
                  <button
                    key={button.key || "all"}
                    onClick={() => setStatusFilter(button.key)}
                    className={[
                      "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                      active
                        ? button.style
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:text-cyan-700",
                    ].join(" ")}
                  >
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-7">
            <BookingsMonthCalendar bookings={bookings} selectedDate={dateFilter} onSelectDate={setDateFilter} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
            </div>
          ) : shownBookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Calendar size={30} className="text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">No bookings found</h3>
              <p className="mx-auto mt-2 max-w-md text-slate-500">
                {dateFilter
                  ? `No bookings on ${dateFilter}.`
                  : statusFilter
                    ? "No bookings match the selected status."
                    : "Create your first booking to get started."}
              </p>
              <button
                onClick={() => navigate("/user/bookings/create")}
                className="mt-6 rounded-xl bg-cyan-600 px-6 py-2.5 font-semibold text-white transition hover:bg-cyan-700"
              >
                Create Booking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {shownBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{booking.resourceName}</h3>
                      <p className="text-sm text-slate-500">{booking.resourceType}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-cyan-600" />
                      <span className="truncate">{booking.resourceLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-cyan-600" />
                      <span>{booking.bookingDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-600" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Purpose:</span> {booking.purpose}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/user/bookings/${booking.id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => navigate(`/user/bookings/${booking.id}`)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    )}

                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => navigate(`/user/bookings/${booking.id}/check-in`)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <QrCode size={16} />
                        Check-In
                      </button>
                    )}

                    {booking.status === "APPROVED" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        title="Cancel booking"
                      >
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    )}

                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        title="Delete booking"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}

                    {booking.status === "REJECTED" && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
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
    </UserLayout>
  );
};

export default BookingDashboard;

