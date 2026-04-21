import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import {
  TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, ArrowLeft, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { getResourceAnalytics } from "../../../services/resourceService";

const COLORS = ["#7c3aed", "#2563eb", "#0d9488", "#ea580c", "#db2777", "#65a30d"];

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall", LAB: "Lab",
  MEETING_ROOM: "Meeting Room", EQUIPMENT: "Equipment",
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-base font-bold text-slate-700 mb-3">{children}</h2>
);

const AdminResourceAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getResourceAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Prepare chart data
  const topResourcesData = analytics?.topResources?.map((r) => ({
    name: r.resourceName.length > 16 ? r.resourceName.slice(0, 14) + "…" : r.resourceName,
    bookings: r.bookingCount,
    type: TYPE_LABELS[r.resourceType] || r.resourceType,
  })) || [];

  const byTypeData = analytics
    ? Object.entries(analytics.bookingsByType).map(([type, count]) => ({
        name: TYPE_LABELS[type] || type,
        value: Number(count),
      }))
    : [];

  const byHourData = analytics
    ? Array.from({ length: 24 }, (_, h) => ({
        hour: `${String(h).padStart(2, "0")}:00`,
        bookings: Number(analytics.bookingsByHour?.[h] ?? 0),
      })).filter((d) => d.bookings > 0)
    : [];

  const utilisationData = analytics?.utilisationRates?.slice(0, 8).map((r) => ({
    name: r.resourceName.length > 14 ? r.resourceName.slice(0, 12) + "…" : r.resourceName,
    utilisation: r.utilisationPercent,
    bookedHrs: r.totalBookedHours,
    availHrs: r.availableHoursPerDay,
  })) || [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/facilities")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Resource Usage Analytics</h1>
              <p className="text-sm text-slate-500 mt-0.5">Booking trends, peak hours and utilisation rates</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto">

          {loading && !analytics ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* ── Summary stat cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp}   label="Total Bookings"     value={analytics.totalBookings}     color="bg-purple-600" />
                <StatCard icon={CheckCircle}  label="Approved"           value={analytics.approvedBookings}  color="bg-emerald-600" />
                <StatCard icon={AlertCircle}  label="Pending"            value={analytics.pendingBookings}   color="bg-amber-500" />
                <StatCard icon={XCircle}      label="Cancelled"          value={analytics.cancelledBookings} color="bg-red-500" />
              </div>

              {/* ── Top resources + by type ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top 5 most booked */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <SectionTitle>Top 5 Most Booked Resources</SectionTitle>
                  {topResourcesData.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No booking data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topResourcesData} layout="vertical"
                        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v, _, p) => [v, "Bookings"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                        <Bar dataKey="bookings" radius={[0, 6, 6, 0]}>
                          {topResourcesData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Bookings by type — pie */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <SectionTitle>Bookings by Resource Type</SectionTitle>
                  {byTypeData.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No booking data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={byTypeData} cx="50%" cy="50%" outerRadius={80}
                          dataKey="value" nameKey="name" label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {byTypeData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [v, "Bookings"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                        <Legend iconType="circle" iconSize={10}
                          formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── Peak booking hours ── */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <SectionTitle>Peak Booking Hours</SectionTitle>
                {byHourData.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No booking data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={byHourData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="bookings" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* ── Utilisation table ── */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <SectionTitle>Resource Utilisation Rates (last 30 days estimate)</SectionTitle>
                {utilisationData.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No resources found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Resource", "Utilisation", "Booked Hours (total)", "Available Hrs/Day"].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {utilisationData.map((r, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-800">{r.name}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${r.utilisation}%`,
                                      backgroundColor: r.utilisation > 70 ? "#ef4444" : r.utilisation > 40 ? "#f59e0b" : "#10b981",
                                    }}
                                  />
                                </div>
                                <span className={`text-xs font-bold ${
                                  r.utilisation > 70 ? "text-red-600" : r.utilisation > 40 ? "text-amber-600" : "text-emerald-600"
                                }`}>{r.utilisation}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{r.bookedHrs} hrs</td>
                            <td className="py-3 px-3 text-slate-600">{r.availHrs} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminResourceAnalytics;
