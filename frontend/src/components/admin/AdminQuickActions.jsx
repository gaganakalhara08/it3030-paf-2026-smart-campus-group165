import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, BarChart3, Settings } from "lucide-react";

const AdminQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <button
        onClick={() => navigate("/admin/bookings")}
        className="bg-slate-800 border border-purple-500 border-opacity-30 hover:border-opacity-100 p-6 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-lg group-hover:bg-purple-700">
            <Calendar size={24} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-lg">Booking Management</p>
            <p className="text-purple-300 text-sm">Approve/Reject bookings</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate("/admin/analytics")}
        className="bg-slate-800 border border-purple-500 border-opacity-30 hover:border-opacity-100 p-6 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-700">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-lg">Analytics</p>
            <p className="text-purple-300 text-sm">View system insights</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate("/login")}
        className="bg-slate-800 border border-purple-500 border-opacity-30 hover:border-opacity-100 p-6 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-600 rounded-lg group-hover:bg-gray-700">
            <Settings size={24} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-lg">Settings</p>
            <p className="text-purple-300 text-sm">System settings (coming soon)</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default AdminQuickActions;