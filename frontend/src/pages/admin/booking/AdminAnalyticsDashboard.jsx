import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users, Calendar, Zap, FileText } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout, { AdminPageHeader } from "../../../components/admin/AdminLayout";
import { API_BASE_URL } from "../../../services/api";

const AdminAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/bookings/admin/analytics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444"];

  const StatCard = ({ icon: Icon, label, value, tone }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          {React.createElement(Icon, { size: 22 })}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Booking Analytics"
        title="Analytics Dashboard"
        description="Review booking insights, usage trends, and resource utilization reports."
        actions={
              <button
                onClick={() => navigate("/admin/bookings")}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
              >
                <FileText size={17} className="text-slate-400" />
                Return to Bookings
              </button>
        }
      />

        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
              <p className="mt-4 text-sm font-medium text-slate-500">Computing analytics data...</p>
            </div>
          ) : (
            <div>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  icon={Calendar} 
                  label="Total Bookings" 
                  value={analytics?.totalBookings || 0} 
                  tone="bg-sky-50 text-sky-600"
                />
                <StatCard 
                  icon={TrendingUp} 
                  label="Approved Bookings" 
                  value={analytics?.approvedBookings || 0} 
                  tone="bg-emerald-50 text-emerald-600"
                />
                <StatCard 
                  icon={Zap} 
                  label="Pending Requests" 
                  value={analytics?.pendingBookings || 0} 
                  tone="bg-amber-50 text-amber-600"
                />
                <StatCard 
                  icon={Users} 
                  label="Avg Attendees" 
                  value={Math.round(analytics?.averageAttendees || 0)} 
                  tone="bg-violet-50 text-violet-600"
                />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Top utilized resources</h2>
                  {analytics?.topResources && analytics.topResources.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.topResources} margin={{ left: -20, bottom: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                          {analytics.topResources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 font-medium">
                      Not enough data yet
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Booking Status Breakdown</h2>
                  {analytics?.statusDistribution && Object.keys(analytics.statusDistribution).length > 0 ? (
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(analytics.statusDistribution).map(([key, value]) => ({
                              name: key,
                              value: value,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {Object.entries(analytics.statusDistribution).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: "14px", fontWeight: "600", paddingTop: "20px"}}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                   <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 font-medium">
                     No distribution data available
                   </div>
                  )}
                </div>
              </div>

              <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Peak Booking Hours</h2>
                {analytics?.peakHours && analytics.peakHours.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.peakHours} margin={{ left: -20, bottom: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#6366f1"
                        strokeWidth={4}
                        dot={{ fill: "#ffffff", stroke: "#6366f1", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: "#4f46e5" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 font-medium">
                    Insufficient data for hourly trends
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsDashboard;
