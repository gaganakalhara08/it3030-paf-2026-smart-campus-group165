import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, BarChart3, Calendar, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      setUser(data);
      console.log("✅ User data:", data);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      toast.error("Failed to load user data");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin/all?page=0&size=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      const content = data.content || [];

      setStats({
        totalBookings: data.totalElements || 0,
        pendingBookings: content.filter((b) => b.status === "PENDING").length,
        approvedBookings: content.filter((b) => b.status === "APPROVED").length,
        totalUsers: new Set(content.map((b) => b.userId)).size,
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">📊 Admin Dashboard</h1>
              <p className="text-purple-300 mt-1">Manage bookings and system settings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">{user?.name || "Admin"}</p>
                <p className="text-purple-300 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
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

            {/* Quick Actions */}
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
                onClick={() => navigate("/dashboard")}
                className="bg-slate-800 border border-purple-500 border-opacity-30 hover:border-opacity-100 p-6 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-700">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">View Dashboard</p>
                    <p className="text-purple-300 text-sm">System overview</p>
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

            {/* Info Section */}
            <div className="bg-slate-800 border border-purple-500 border-opacity-30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">👋 Welcome, {user?.name || "Admin"}!</h2>
              <p className="text-purple-300 mb-4">
                As an administrator, you have access to manage all bookings in the system. Use the buttons above to:
              </p>
              <ul className="text-purple-300 space-y-2 ml-4">
                <li>✅ <span className="text-white font-semibold">Booking Management:</span> Review and approve/reject pending bookings</li>
                <li>✅ <span className="text-white font-semibold">View Dashboard:</span> See system statistics and overview</li>
                <li>✅ <span className="text-white font-semibold">Settings:</span> Configure system settings (coming soon)</li>
              </ul>
              <p className="text-purple-300 mt-6">
                📋 <span className="text-white font-semibold">Pending Bookings:</span> You have <span className="text-yellow-400 font-bold">{stats.pendingBookings}</span> pending bookings awaiting approval.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;