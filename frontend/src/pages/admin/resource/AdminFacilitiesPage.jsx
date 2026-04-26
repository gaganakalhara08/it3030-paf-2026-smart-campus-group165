import React, { useState, useEffect } from "react";
import { Plus, LayoutGrid, List, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout, { AdminPageHeader } from "../../../components/admin/AdminLayout";
import ResourceCard from "../../../components/resource/ResourceCard";
import ResourceFilters from "../../../components/resource/ResourceFilters";
import ResourceFormModal from "../../../components/resource/ResourceFormModal";
import ResourceDetailModal from "../../../components/resource/ResourceDetailModal";
import DeleteConfirmModal from "../../../components/resource/DeleteConfirmModal";
import ResourcePagination from "../../../components/resource/ResourcePagination";
import ResourceStatsBar from "../../../components/resource/ResourceStatsBar";
import {
  searchResources,
  getResourceStats,
  createResource,
  updateResource,
  updateResourceStatus,
  deleteResource,
} from "../../../services/resourceService";
import { useNavigate } from "react-router-dom";

const AdminFacilitiesPage = () => {
  const navigate = useNavigate();

  // ── Data state
  const [resources, setResources]           = useState([]);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [actionLoading, setActionLoading]   = useState(false);

  // ── Filter / pagination state
  const [filters, setFilters] = useState({
    keyword: "", type: "", status: "", minCapacity: "", location: "",
    page: 0, size: 12, sortBy: "name", sortDir: "asc",
  });

  // ── UI state
  const [viewMode, setViewMode]           = useState("grid"); // grid | list
  const [formOpen, setFormOpen]           = useState(false);
  const [detailOpen, setDetailOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [selectedResource, setSelected]   = useState(null);
  const [editResource, setEditResource]   = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // ── Fetch
  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await searchResources(filters);
      setResources(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const s = await getResourceStats();
      setStats(s);
    } catch {
      console.warn("Failed to load resource stats");
    }
  };

  useEffect(() => { fetchResources(); }, [filters]);
  useEffect(() => { fetchStats(); },    []);

  const updateFilters = (patch) => setFilters((p) => ({ ...p, ...patch, page: 0 }));
  const clearFilters  = () => setFilters((p) => ({ ...p, keyword: "", type: "", status: "", minCapacity: "", location: "", page: 0 }));

  // ── Handlers
  const handleCreate = async (payload) => {
    setActionLoading(true);
    try {
      await createResource(payload);
      toast.success("Resource created successfully!");
      setFormOpen(false);
      setEditResource(null);
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err?.message || "Failed to create resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    setActionLoading(true);
    try {
      await updateResource(editResource.id, payload);
      toast.success("Resource updated successfully!");
      setFormOpen(false);
      setEditResource(null);
      fetchResources();
    } catch (err) {
      toast.error(err?.message || "Failed to update resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteResource(deleteTarget.id);
      toast.success("Resource deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err?.message || "Failed to delete resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (resource) => {
    const next = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await updateResourceStatus(resource.id, next);
      toast.success(`Status updated to ${next.replace("_", " ")}`);
      fetchResources();
      fetchStats();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (resource) => {
    setEditResource(resource);
    setFormOpen(true);
  };

  const openDelete = (resource) => {
    setDeleteTarget(resource);
    setDeleteOpen(true);
  };

  const openDetail = (resource) => {
    setSelected(resource);
    setDetailOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Facilities"
        title="Facilities & Assets Catalogue"
        description="Manage campus rooms, labs, meeting spaces, and equipment."
        actions={
          <>
            <button onClick={() => { fetchResources(); fetchStats(); }}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700">
              <RefreshCw size={15} />
              Refresh
            </button>
            <button onClick={() => { setEditResource(null); setFormOpen(true); }}
              className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
              <Plus size={16} />
              Add Resource
            </button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8 lg:px-8">

          {/* Stats bar */}
          <ResourceStatsBar stats={stats} />

          {/* Filters */}
          <ResourceFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClear={clearFilters}
          />

          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : `${totalElements} resource${totalElements !== 1 ? "s" : ""} found`}
            </p>
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}>
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Resource Grid / List */}
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-52 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Plus size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No Resources Found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">Try adjusting your filters or add a new resource to the catalogue.</p>
              <button onClick={() => { setEditResource(null); setFormOpen(true); }}
                className="mt-5 flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
                <Plus size={15} /> Add First Resource
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  isAdmin
                  onView={openDetail}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          ) : (
            /* List view */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Name", "Type", "Capacity", "Location", "Availability", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 text-slate-500">{r.type.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-slate-600">{r.capacity}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{r.location}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.availabilityStart?.slice(0,5)} - {r.availabilityEnd?.slice(0,5)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleStatusToggle(r)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            r.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}>
                          {r.status === "ACTIVE" ? "Active" : r.status === "OUT_OF_SERVICE" ? "Out of Service" : "Maintenance"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openDetail(r)} className="text-xs font-medium text-emerald-600 hover:underline">View</button>
                          <button onClick={() => openEdit(r)}   className="text-xs font-medium text-slate-600 hover:underline">Edit</button>
                          <button onClick={() => openDelete(r)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <ResourcePagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={filters.size}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
      </div>

      {/* Modals */}
      <ResourceFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditResource(null); }}
        onSubmit={editResource ? handleUpdate : handleCreate}
        resource={editResource}
        loading={actionLoading}
      />
      <ResourceDetailModal
        isOpen={detailOpen}
        resource={selectedResource}
        onClose={() => setDetailOpen(false)}
        isAdmin
        onEdit={openEdit}
      />
      <DeleteConfirmModal
        isOpen={deleteOpen}
        resource={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        loading={actionLoading}
      />
    </AdminLayout>
  );
};

export default AdminFacilitiesPage;
