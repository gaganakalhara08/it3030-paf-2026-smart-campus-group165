import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

const AdminNotifications = () => {
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-700"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-semibold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <span className="text-xs text-slate-400">{unreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 ${
                    !notification.read ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-sm text-slate-800">{notification.message}</p>
                    {notification.action && (
                      <p className="mt-1 text-xs text-slate-400">{notification.action}</p>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete notification"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
