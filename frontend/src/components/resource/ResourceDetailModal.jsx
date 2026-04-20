import React from "react";
import { X, MapPin, Users, Clock, Building2, Cpu, Calendar, User } from "lucide-react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import ResourceTypeBadge from "./ResourceTypeBadge";

const Row = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-purple-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  ) : null;

const ResourceDetailModal = ({ resource, isOpen, onClose, onBookNow, isAdmin, onEdit }) => {
  if (!isOpen || !resource) return null;

  const formattedDate = (s) => s ? new Date(s).toLocaleDateString("en-LK", { dateStyle: "medium" }) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <ResourceTypeBadge type={resource.type} />
              <ResourceStatusBadge status={resource.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{resource.name}</h2>
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        {resource.imageUrl && (
          <div className="w-full h-44 bg-slate-100 overflow-hidden">
            <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
          </div>
        )}

        <div className="p-6 space-y-1">
          <Row icon={Building2} label="Building / Location"
            value={[resource.building, resource.floor ? `Floor ${resource.floor}` : null, resource.roomNumber].filter(Boolean).join(" · ")} />
          <Row icon={MapPin}     label="Full Location"   value={resource.location} />
          <Row icon={Users}      label="Capacity"        value={`${resource.capacity} persons`} />
          <Row icon={Clock}      label="Availability"    value={`${resource.availabilityStart?.slice(0,5)} – ${resource.availabilityEnd?.slice(0,5)}`} />

          {resource.type === "EQUIPMENT" && (
            <>
              <Row icon={Cpu} label="Brand / Model"   value={[resource.brand, resource.model].filter(Boolean).join(" · ")} />
              <Row icon={Cpu} label="Serial Number"   value={resource.serialNumber} />
            </>
          )}

          <Row icon={Calendar}  label="Added On"       value={formattedDate(resource.createdAt)} />
          <Row icon={User}      label="Added By"       value={resource.createdByName} />

          {resource.description && (
            <div className="pt-3">
              <p className="text-xs text-slate-400 font-medium mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{resource.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          {onBookNow && resource.status === "ACTIVE" && (
            <button onClick={() => onBookNow(resource)}
              className="flex-1 h-11 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
              Book This Resource
            </button>
          )}
          {isAdmin && onEdit && (
            <button onClick={() => { onClose(); onEdit(resource); }}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Edit Resource
            </button>
          )}
          <button onClick={onClose}
            className="h-11 px-5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailModal;
