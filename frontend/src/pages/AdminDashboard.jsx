import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminStats from "../components/admin/AdminStats";
import AdminQuickActions from "../components/admin/AdminQuickActions";
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Left Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 shadow-lg border-b border-purple-500">
          <div className="max-w-7xl mx-auto px-6 py-6 w-full">
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <>
                {/* Admin Stats Component */}
                <AdminStats stats={stats} />

                {/* Admin Quick Actions Component */}
                <AdminQuickActions />

                {/* Info Section */}
                <div className="bg-slate-800 border border-purple-500 border-opacity-30 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">👋 Welcome, {user?.name || "Admin"}!</h2>
                  <p className="text-purple-300 mb-4">
                    As an administrator, you have access to manage all aspects of the Smart Campus system. Use the sidebar to navigate between modules:
                  </p>
                  <ul className="text-purple-300 space-y-2 ml-4">
                    <li>✅ <span className="text-white font-semibold">Booking Management:</span> Review and approve/reject pending bookings</li>
                    <li>✅ <span className="text-white font-semibold">Notification Management:</span> Send system-wide notifications</li>
                    <li>✅ <span className="text-white font-semibold">Ticket Management:</span> Handle user support tickets</li>
                    <li>✅ <span className="text-white font-semibold">User Management:</span> Manage users and assign roles</li>
                    <li>✅ <span className="text-white font-semibold">Facilities Management:</span> Manage campus resources and facilities</li>
                  </ul>
                  <p className="text-purple-300 mt-6">
                    📋 <span className="text-white font-semibold">Pending Bookings:</span> You have <span className="text-yellow-400 font-bold">{stats.pendingBookings}</span> pending bookings awaiting approval.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;