import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Building2,
  Calendar,
  ChevronRight,
  Home,
  LogOut,
  Ticket,
  Users,
} from "lucide-react";
import logo from "../../assets/logo.png";

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      path: "/admin/dashboard",
      description: "Admin home and quick links",
    },
    {
      id: "booking-management",
      label: "Booking Management",
      icon: Calendar,
      path: "/admin/bookings",
      description: "Approvals and records",
    },
    {
      id: "ticket-management",
      label: "Ticket Management",
      icon: Ticket,
      path: "/admin/tickets",
      description: "Support and maintenance",
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      description: "Accounts and roles",
    },
    {
      id: "facilities-management",
      label: "Facilities",
      icon: Building2,
      path: "/admin/facilities",
      description: "Rooms, labs and assets",
    },
    {
      id: "resource-analytics",
      label: "Resource Analytics",
      icon: BarChart2,
      path: "/admin/resource-analytics",
      description: "Usage insights",
    },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="flex flex-col items-center border-b border-slate-100 px-6 py-6 text-center transition hover:bg-slate-50"
      >
        <img src={logo} alt="Campus Ops" className="mb-2 h-14 w-32 object-contain" />
        <span className="text-lg font-semibold text-slate-900">Campus Ops</span>
        <span className="text-xs text-slate-400">Admin Portal</span>
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={20} className={active ? "text-emerald-600" : "text-slate-400"} />
              <span className="min-w-0 flex-1 text-left">
                <span className={`block text-sm ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
                <span className="block truncate text-xs text-slate-400">{item.description}</span>
              </span>
              {active && <ChevronRight size={16} className="text-emerald-600" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-5">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
