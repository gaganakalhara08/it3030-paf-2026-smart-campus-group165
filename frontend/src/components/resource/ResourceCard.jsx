import React from "react";
import { Box, Building2, Clock, Cpu, FlaskConical, MapPin, MonitorPlay, Users } from "lucide-react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import ResourceTypeBadge from "./ResourceTypeBadge";

const TYPE_ICONS = {
  LECTURE_HALL: Building2,
  LAB: FlaskConical,
  MEETING_ROOM: MonitorPlay,
  EQUIPMENT: Cpu,
};

const ResourceCard = ({ resource, onView, onEdit, onDelete, isAdmin = false }) => {
  const Icon = TYPE_ICONS[resource.type] || Box;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="h-1.5 bg-emerald-600" />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              {React.createElement(Icon, { size: 19 })}
            </span>
            <div>
              <h3 className="line-clamp-1 text-sm font-bold leading-tight text-slate-800">{resource.name}</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {resource.building}
                {resource.floor ? ` - Floor ${resource.floor}` : ""}
                {resource.roomNumber ? ` - ${resource.roomNumber}` : ""}
              </p>
            </div>
          </div>
          <ResourceStatusBadge status={resource.status} />
        </div>

        <ResourceTypeBadge type={resource.type} />

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-emerald-500" />
            {resource.capacity} seats
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-emerald-500" />
            <span className="max-w-[100px] truncate">{resource.location}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-emerald-500" />
            {resource.availabilityStart?.slice(0, 5)} - {resource.availabilityEnd?.slice(0, 5)}
          </span>
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{resource.description}</p>
        )}

        {resource.type === "EQUIPMENT" && (resource.brand || resource.model) && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Cpu size={12} className="text-emerald-500" />
            {[resource.brand, resource.model].filter(Boolean).join(" - ")}
          </div>
        )}

        <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => onView?.(resource)}
            className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            View Details
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(resource)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(resource)}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
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
