import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Plus, Home } from "lucide-react";

const UserHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Campus Portal</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all your campus resources and requests</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <Home size={16} />
            User Dashboard
          </button>
          <button
            onClick={() => navigate("/user/bookings/dashboard")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <LayoutDashboard size={16} />
            Booking Dashboard
          </button>
          <button
            onClick={() => navigate("/user/bookings/create")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <Plus size={16} />
            Create Booking
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;