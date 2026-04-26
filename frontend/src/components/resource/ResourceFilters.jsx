import React from "react";
import { Search, X } from "lucide-react";

const TYPES    = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["", "ACTIVE", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"];
const TYPE_LABELS = { "": "All Types", LECTURE_HALL: "Lecture Hall", LAB: "Lab", MEETING_ROOM: "Meeting Room", EQUIPMENT: "Equipment" };
const STATUS_LABELS = { "": "All Statuses", ACTIVE: "Active", OUT_OF_SERVICE: "Out of Service", UNDER_MAINTENANCE: "Under Maintenance" };

const Select = ({ value, onChange, options, labels }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
  >
    {options.map((o) => <option key={o} value={o}>{labels[o]}</option>)}
  </select>
);

const ResourceFilters = ({ filters, onFilterChange, onClear }) => {
  const hasActiveFilters = filters.keyword || filters.type || filters.status || filters.minCapacity || filters.location;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Keyword search */}
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={filters.keyword}
            onChange={(e) => onFilterChange({ keyword: e.target.value })}
            className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <Select value={filters.type}   onChange={(v) => onFilterChange({ type: v })}   options={TYPES}    labels={TYPE_LABELS}    />
        <Select value={filters.status} onChange={(v) => onFilterChange({ status: v })} options={STATUSES} labels={STATUS_LABELS}  />

        {/* Min capacity */}
        <input
          type="number"
          placeholder="Min capacity"
          value={filters.minCapacity}
          onChange={(e) => onFilterChange({ minCapacity: e.target.value })}
          min={1}
          className="h-10 w-32 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Location */}
        <input
          type="text"
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="h-10 w-36 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceFilters;
