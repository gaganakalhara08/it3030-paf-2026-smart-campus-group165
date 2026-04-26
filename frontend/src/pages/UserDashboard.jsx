import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, LifeBuoy, Plus, Search, Sparkles } from "lucide-react";
import UserLayout from "../components/user/UserLayout";
import { API_BASE_URL } from "../services/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  async function fetchUser() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, []);

  const quickActions = [
    {
      title: "Browse Resources",
      description: "Find lecture halls, labs, meeting rooms, and equipment.",
      icon: Search,
      path: "/user/resources",
      tint: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Create Booking",
      description: "Reserve a campus resource with availability checks.",
      icon: Plus,
      path: "/user/bookings/create",
      tint: "bg-sky-50 text-sky-700",
    },
    {
      title: "My Bookings",
      description: "Review booking status, QR check-ins, and cancellations.",
      icon: CalendarCheck,
      path: "/user/bookings/dashboard",
      tint: "bg-amber-50 text-amber-700",
    },
    {
      title: "Support Tickets",
      description: "Raise or follow campus support and maintenance issues.",
      icon: LifeBuoy,
      path: "/user/dashboard/tickets",
      tint: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <UserLayout user={user}>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-8 lg:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} />
              Smart Campus workspace
            </div>
            <h2 className="max-w-3xl text-3xl font-bold tracking-normal text-slate-900 md:text-4xl">
              Welcome{user?.name || userName ? `, ${user?.name || userName}` : ""}.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              Manage bookings, discover campus resources, and keep support requests moving from one calm, focused dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/user/resources")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Search size={16} />
                Browse Resources
              </button>
              <button
                type="button"
                onClick={() => navigate("/user/bookings/create")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Plus size={16} />
                New Booking
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-slate-900">Today at a glance</p>
            <div className="mt-5 space-y-3">
              {["Choose a resource", "Check availability", "Submit and track status"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => navigate(action.path)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${action.tint}`}>
                <Icon size={20} />
              </span>
              <span className="block text-base font-semibold text-slate-900">{action.title}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">{action.description}</span>
            </button>
          );
        })}
      </section>
    </UserLayout>
  );
};

export default UserDashboard;
