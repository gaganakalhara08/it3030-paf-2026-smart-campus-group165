import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, User } from "lucide-react";
import toast from "react-hot-toast";
import ResourceCard from "../../../components/resource/ResourceCard";
import ResourceFilters from "../../../components/resource/ResourceFilters";
import ResourceDetailModal from "../../../components/resource/ResourceDetailModal";
import ResourcePagination from "../../../components/resource/ResourcePagination";
import { useResources } from "../../../hooks/useResources";

const UserResourceCatalogue = () => {
  const navigate = useNavigate();
  const {
    resources, totalPages, totalElements, loading,
    filters, updateFilters, setPage,
  } = useResources({ status: "ACTIVE" }); // users only see active by default

  const [detailOpen, setDetailOpen]       = useState(false);
  const [selectedResource, setSelected]   = useState(null);

  const openDetail = (resource) => { setSelected(resource); setDetailOpen(true); };

  const handleBookNow = (resource) => {
    navigate("/user/bookings/create", { state: { resourceId: resource.id, resourceName: resource.name } });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const clearFilters = () =>
    updateFilters({ keyword: "", type: "", status: "ACTIVE", minCapacity: "", location: "" });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Smart Campus</h1>
            <p className="text-xs text-slate-400">Resource Catalogue</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/user/bookings/dashboard")}
            className="h-9 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            My Bookings
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold">Browse Campus Resources</h2>
          <p className="text-purple-200 mt-1 text-sm">Find and book lecture halls, labs, meeting rooms and equipment</p>
        </div>

        {/* Filters — allow users to also filter by any status if they want */}
        <ResourceFilters
          filters={filters}
          onFilterChange={updateFilters}
          onClear={clearFilters}
        />

        {/* Results count */}
        <p className="text-sm text-slate-500">
          {loading ? "Searching…" : `${totalElements} resource${totalElements !== 1 ? "s" : ""} available`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-700">No Resources Found</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                isAdmin={false}
                onView={openDetail}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <ResourcePagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={filters.size}
          onPageChange={setPage}
        />
      </div>

      {/* Detail modal with Book Now */}
      <ResourceDetailModal
        isOpen={detailOpen}
        resource={selectedResource}
        onClose={() => setDetailOpen(false)}
        onBookNow={handleBookNow}
        isAdmin={false}
      />
    </div>
  );
};

export default UserResourceCatalogue;
