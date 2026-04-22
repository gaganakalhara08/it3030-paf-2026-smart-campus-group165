import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users, Calendar, Zap, LayoutGrid, FileText } from "lucide-react";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/admin/AdminSidebar";

// Ensure this matches your existing API base URL mapping if necessary
const API_BASE_URL = "http://localhost:8080/api";

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

  const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];

  const StatCard = ({ icon: Icon, label, value, gradient, shadow }) => (
    <div className={`relative overflow-hidden rounded-3xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${shadow} border border-slate-100`}>
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 bg-gradient-to-br ${gradient}`}></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-black text-slate-800">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative">
        {/* Background abstract decoration */}
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-transparent -z-10 blur-3xl pointer-events-none"></div>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto mt-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold tracking-wide">
                <LayoutGrid size={16} />
                ANALYTICS ENGINE
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                Analytics Dashboard
              </h1>
              <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">
                Real-time booking insights, usage trends, and overall resource utilisation reports.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("/admin/bookings")}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:text-indigo-600"
              >
                <FileText size={18} className="text-slate-400 group-hover:text-indigo-500" />
                Return to Bookings
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white/50 rounded-3xl border border-slate-100">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-indigo-400 opacity-20"></div>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              </div>
              <p className="mt-6 text-slate-500 font-medium animate-pulse">Computing analytics data...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                  icon={Calendar} 
                  label="Total Bookings" 
                  value={analytics?.totalBookings || 0} 
                  gradient="from-blue-500 to-indigo-600" 
                  shadow="shadow-xl shadow-indigo-100/50" 
                />
                <StatCard 
                  icon={TrendingUp} 
                  label="Approved Bookings" 
                  value={analytics?.approvedBookings || 0} 
                  gradient="from-emerald-400 to-teal-500" 
                  shadow="shadow-xl shadow-teal-100/50" 
                />
                <StatCard 
                  icon={Zap} 
                  label="Pending Requests" 
                  value={analytics?.pendingBookings || 0} 
                  gradient="from-amber-400 to-orange-500" 
                  shadow="shadow-xl shadow-orange-100/50" 
                />
                <StatCard 
                  icon={Users} 
                  label="Avg Attendees" 
                  value={Math.round(analytics?.averageAttendees || 0)} 
                  gradient="from-rose-500 to-pink-600" 
                  shadow="shadow-xl shadow-rose-100/50" 
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Top Resources Chart */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
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
                    <div className="flex h-[300px] items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 font-medium">
                      Not enough data yet
                    </div>
                  )}
                </div>

                {/* Booking Status Distribution */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
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
                   <div className="flex h-[300px] items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 font-medium">
                     No distribution data available
                   </div>
                  )}
                </div>
              </div>

              {/* Peak Hours Line Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-10 hover:shadow-md transition-shadow">
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
                  <div className="flex h-[300px] items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 font-medium">
                    Insufficient data for hourly trends
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;