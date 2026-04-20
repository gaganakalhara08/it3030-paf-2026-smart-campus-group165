import React from "react";

const CONFIG = {
  LECTURE_HALL: { label: "Lecture Hall", bg: "bg-violet-100", text: "text-violet-700" },
  LAB:          { label: "Lab",          bg: "bg-blue-100",   text: "text-blue-700"   },
  MEETING_ROOM: { label: "Meeting Room", bg: "bg-teal-100",   text: "text-teal-700"   },
  EQUIPMENT:    { label: "Equipment",    bg: "bg-orange-100", text: "text-orange-700"  },
};

const ResourceTypeBadge = ({ type }) => {
  const cfg = CONFIG[type] || { label: type, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

export default ResourceTypeBadge;
