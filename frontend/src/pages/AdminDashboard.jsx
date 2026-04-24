import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, CalendarCheck, Clock, Users } from "lucide-react";
import AdminLayout, { AdminPageHeader } from "../components/admin/AdminLayout";
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
    } catch (error) {
      console.error("Error fetching user:", error);
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
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Overview"
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        description="Monitor campus operations, review pending work, and move quickly into the core admin tools."
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>
        ) : (
          <div className="space-y-8">
            <AdminStats stats={stats} />
            <AdminQuickActions />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h2 className="m-0 text-lg font-semibold text-slate-900">Operational Snapshot</h2>
                  <p className="text-sm text-slate-500">Key admin areas that need regular attention.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Clock size={18} className="mb-3 text-amber-600" />
                  <p className="text-sm font-semibold text-slate-900">{stats.pendingBookings} pending approvals</p>
                  <p className="mt-1 text-sm text-slate-500">Review booking requests awaiting a decision.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <CalendarCheck size={18} className="mb-3 text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-900">{stats.approvedBookings} approved bookings</p>
                  <p className="mt-1 text-sm text-slate-500">Track confirmed campus resource usage.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Users size={18} className="mb-3 text-sky-600" />
                  <p className="text-sm font-semibold text-slate-900">{stats.totalUsers} active booking users</p>
                  <p className="mt-1 text-sm text-slate-500">Manage access and roles from user management.</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
