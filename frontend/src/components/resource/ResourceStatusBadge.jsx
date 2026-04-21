import React from "react";

const CONFIG = {
  ACTIVE:            { label: "Active",            bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  OUT_OF_SERVICE:    { label: "Out of Service",    bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  UNDER_MAINTENANCE: { label: "Under Maintenance", bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
};

const ResourceStatusBadge = ({ status, size = "sm" }) => {
  const cfg = CONFIG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.bg} ${cfg.text} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default ResourceStatusBadge;
