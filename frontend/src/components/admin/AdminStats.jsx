import React from "react";
import { Calendar, BarChart3, Users } from "lucide-react";

const AdminStats = ({ stats }) => {
  const StatBox = ({ icon: Icon, title, value, color }) => (
    <div className={`${color} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatBox
        icon={Calendar}
        title="Total Bookings"
        value={stats.totalBookings}
        color="bg-gradient-to-br from-blue-600 to-blue-800"
      />
      <StatBox
        icon={BarChart3}
        title="Pending Approvals"
        value={stats.pendingBookings}
        color="bg-gradient-to-br from-yellow-600 to-yellow-800"
      />
      <StatBox
        icon={Calendar}
        title="Approved Bookings"
        value={stats.approvedBookings}
        color="bg-gradient-to-br from-green-600 to-green-800"
      />
      <StatBox
        icon={Users}
        title="Total Users"
        value={stats.totalUsers}
        color="bg-gradient-to-br from-purple-600 to-purple-800"
      />
    </div>
  );
};

export default AdminStats;