import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import ResourceCard from "../../../components/resource/ResourceCard";
import ResourceFilters from "../../../components/resource/ResourceFilters";
import ResourceDetailModal from "../../../components/resource/ResourceDetailModal";
import ResourcePagination from "../../../components/resource/ResourcePagination";
import UserLayout from "../../../components/user/UserLayout";
import { useResources } from "../../../hooks/useResources";

const UserResourceCatalogue = () => {
  const navigate = useNavigate();
  const { resources, totalPages, totalElements, loading, filters, updateFilters, setPage } =
    useResources({ status: "ACTIVE" });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResource, setSelected] = useState(null);

  const openDetail = (resource) => {
    setSelected(resource);
    setDetailOpen(true);
  };

  const handleBookNow = (resource) => {
    navigate("/user/bookings/create", {
      state: { resourceId: resource.id, resourceName: resource.name },
    });
  };

  const clearFilters = () =>
    updateFilters({ keyword: "", type: "", status: "ACTIVE", minCapacity: "", location: "" });

  return (
    <UserLayout
      headerActions={
        <button
          type="button"
          onClick={() => navigate("/user/bookings/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <CalendarCheck size={16} />
          My Bookings
        </button>
      }
    >
      <div className="space-y-6">
        <ResourceFilters filters={filters} onFilterChange={updateFilters} onClear={clearFilters} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {loading
              ? "Searching..."
              : `${totalElements} resource${totalElements !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-700">No Resources Found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isAdmin={false}
                onView={openDetail}
              />
            ))}
          </div>
        )}

        <ResourcePagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={filters.size}
          onPageChange={setPage}
        />
      </div>

      <ResourceDetailModal
        isOpen={detailOpen}
        resource={selectedResource}
        onClose={() => setDetailOpen(false)}
        onBookNow={handleBookNow}
        isAdmin={false}
      />
    </UserLayout>
  );
};

export default UserResourceCatalogue;
