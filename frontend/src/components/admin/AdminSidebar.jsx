import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Bell,
  Ticket,
  Users,
  Building2,
  LogOut,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import logo from "../../assets/logo.png"; // adjust path if needed

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "booking-management",
      label: "Booking Management",
      icon: Calendar,
      path: "/admin/bookings",
      description: "Manage bookings and approvals",
    },
    {
      id: "ticket-management",
      label: "Ticket Management",
      icon: Ticket,
      path: "/admin/tickets",
      description: "Handle support tickets",
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      description: "Manage users and roles",
    },
    {
      id: "facilities-management",
      label: "Facilities Management",
      icon: Building2,
      path: "/admin/facilities",
      description: "Manage resources",
    },
    {
      id: "resource-analytics",
      label: "Resource Analytics",
      icon: BarChart2,
      path: "/admin/resource-analytics",
      description: "Usage insights",
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50">
      
      {/* 🔝 Logo Section (Clickable → Dashboard) */}
      <div
        onClick={() => navigate("/dashboard")}
        className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
      >
        <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Campus Ops
          </h2>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
      </div>

      {/* 📚 Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon
                size={20}
                className={`${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              />

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-400">
                  {item.description}
                </p>
              </div>

              {active && (
                <ChevronRight size={16} className="text-green-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 🔻 Logout */}
      <div className="px-3 py-5 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

    </div>
  );
};

export default AdminSidebar;