import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar, Bell, Ticket, Users, Building2, LogOut, ChevronRight, BarChart2
} from "lucide-react";

const AdminSidebar = ({ onLogout }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const menuItems = [
    {
      id: "booking-management",
      label: "Booking Management",
      icon: Calendar,
      path: "/admin/bookings",
      description: "Manage all bookings and approvals"
    },
    {
      id: "notification-management",
      label: "Notification Management",
      icon: Bell,
      path: "/admin/notifications",
      description: "Send and manage notifications"
    },
    {
      id: "ticket-management",
      label: "Ticket Management",
      icon: Ticket,
      path: "/admin/tickets",
      description: "Handle support tickets"
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      description: "Manage users and roles"
    },
    {
      id: "facilities-management",
      label: "Facilities Management",
      icon: Building2,
      path: "/admin/facilities",
      description: "Manage campus resources"
    },
    {
      id: "resource-analytics",
      label: "Resource Analytics",
      icon: BarChart2,
      path: "/admin/resource-analytics",
      description: "Usage trends & utilisation"
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="w-64 bg-slate-800 min-h-screen border-r border-purple-500 border-opacity-30 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-purple-500 border-opacity-30">
        <h2 className="text-xl font-bold text-white">Smart Campus</h2>
        <p className="text-purple-300 text-xs mt-1">Admin Portal</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                active
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-purple-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon size={20} className={active ? "text-white" : "text-purple-400"} />
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className={`text-xs ${active ? "text-purple-100" : "text-purple-400"}`}>
                  {item.description}
                </p>
              </div>
              {active && <ChevronRight size={18} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-purple-500 border-opacity-30">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
