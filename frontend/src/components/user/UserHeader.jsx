import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../services/api";
import NotificationPreferences from "./NotificationPreferences"; // ✅ NEW

const pageMeta = [
  {
    match: "/user/bookings/create",
    eyebrow: "Bookings",
    title: "Create Booking",
    description: "Reserve rooms, labs, equipment, and shared campus spaces.",
  },
  {
    match: "/user/bookings",
    eyebrow: "Bookings",
    title: "My Bookings",
    description: "Track reservations, approvals, QR check-ins, and schedule changes.",
  },
  {
    match: "/user/dashboard/tickets",
    eyebrow: "Support",
    title: "Tickets",
    description: "Raise support requests and follow their progress.",
  },
  {
    match: "/user/resources",
    eyebrow: "Resources",
    title: "Browse Resources",
    description: "Find active campus facilities and equipment ready for booking.",
  },
];

const UserHeader = ({ user, actions }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false); // ✅ NEW

  const meta =
    pageMeta.find((item) => location.pathname.startsWith(item.match)) || {
      eyebrow: "Overview",
      title: "Dashboard",
      description:
        "Plan your campus day, review requests, and jump back into your work.",
    };

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {meta.eyebrow}
          </p>
          <h1 className="m-0 text-2xl font-bold tracking-normal text-slate-900 md:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500 md:text-base">
            {meta.description}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-3">
          {actions}

          {/* 🔔 Notification Button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          {/* 🔽 DROPDOWN */}
          {open && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-white shadow-xl">

              {/* HEADER */}
              <div className="flex justify-between items-center border-b px-4 py-3">
                <div>
                  <p className="font-semibold">Notifications</p>
                  <p className="text-xs text-gray-500">
                    {unreadCount} unread
                  </p>
                </div>

                {/* ⚙ SETTINGS BUTTON */}
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  ⚙
                </button>
              </div>

              {/* 🔥 PREFERENCES PANEL */}
              {showPreferences && (
                <NotificationPreferences
                  onClose={() => setShowPreferences(false)}
                />
              )}

              {/* NOTIFICATION LIST */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 border-b p-4 ${
                        !n.read ? "bg-green-50" : ""
                      }`}
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => markAsRead(n.id)}
                      >
                        <p className="text-sm">{n.message}</p>
                      </button>

                      <button onClick={() => deleteNotification(n.id)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;