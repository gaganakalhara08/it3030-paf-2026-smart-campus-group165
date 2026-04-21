import React from "react";
import { MapPin, Users, Clock, Building2, Cpu } from "lucide-react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import ResourceTypeBadge from "./ResourceTypeBadge";

const TYPE_ICONS = {
  LECTURE_HALL: "🎓",
  LAB:          "🔬",
  MEETING_ROOM: "🗓️",
  EQUIPMENT:    "🎥",
};

const ResourceCard = ({ resource, onView, onEdit, onDelete, isAdmin = false }) => {
  const icon = TYPE_ICONS[resource.type] || "📦";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {/* Colour-strip header */}
      <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-600" />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Top row: icon + name + type badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{resource.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{resource.building}{resource.floor ? ` · Floor ${resource.floor}` : ""}{resource.roomNumber ? ` · ${resource.roomNumber}` : ""}</p>
            </div>
          </div>
          <ResourceStatusBadge status={resource.status} />
        </div>

        {/* Type badge */}
        <ResourceTypeBadge type={resource.type} />

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-purple-400" />
            {resource.capacity} seats
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-purple-400" />
            <span className="truncate max-w-[100px]">{resource.location}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-purple-400" />
            {resource.availabilityStart?.slice(0,5)} – {resource.availabilityEnd?.slice(0,5)}
          </span>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{resource.description}</p>
        )}

        {/* Equipment metadata */}
        {resource.type === "EQUIPMENT" && (resource.brand || resource.model) && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Cpu size={12} className="text-purple-400" />
            {[resource.brand, resource.model].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => onView?.(resource)}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            View Details
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(resource)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(resource)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
