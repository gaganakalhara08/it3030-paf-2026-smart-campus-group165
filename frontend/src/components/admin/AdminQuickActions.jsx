import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Building2, Calendar, Ticket, Users } from "lucide-react";

const AdminQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Booking Management",
      description: "Approve, reject, and export bookings",
      icon: Calendar,
      path: "/admin/bookings",
    },
    {
      label: "Ticket Management",
      description: "Review support and maintenance tickets",
      icon: Ticket,
      path: "/admin/tickets",
    },
    {
      label: "Users",
      description: "Manage roles and access",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "Facilities",
      description: "Maintain rooms, labs, and equipment",
      icon: Building2,
      path: "/admin/facilities",
    },
    {
      label: "Resource Analytics",
      description: "Understand utilization and demand",
      icon: BarChart3,
      path: "/admin/resource-analytics",
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="m-0 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <p className="text-sm text-slate-500">Jump into the most common admin workflows.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {actions.map(({ label, description, icon: Icon, path }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
              {React.createElement(Icon, { size: 20 })}
            </div>
            <p className="font-semibold text-slate-900">{label}</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default AdminQuickActions;
