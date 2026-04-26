import React from "react";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";

const AdminStats = ({ stats }) => {
  const cards = [
    { icon: Calendar, title: "Total Bookings", value: stats.totalBookings, tone: "text-sky-600 bg-sky-50" },
    { icon: Clock, title: "Pending Approvals", value: stats.pendingBookings, tone: "text-amber-600 bg-amber-50" },
    { icon: CheckCircle, title: "Approved Bookings", value: stats.approvedBookings, tone: "text-emerald-600 bg-emerald-50" },
    { icon: Users, title: "Total Users", value: stats.totalUsers, tone: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ icon: Icon, title, value, tone }) => (
        <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
              {React.createElement(Icon, { size: 22 })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
