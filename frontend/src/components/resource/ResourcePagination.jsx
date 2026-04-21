import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ResourcePagination = ({ currentPage, totalPages, onPageChange, totalElements, pageSize }) => {
  if (totalPages <= 1) return null;
  const from = currentPage * pageSize + 1;
  const to   = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of <span className="font-semibold text-slate-700">{totalElements}</span> resources
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => Math.abs(i - currentPage) <= 2)
          .map((i) => (
            <button key={i} onClick={() => onPageChange(i)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                i === currentPage
                  ? "bg-purple-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {i + 1}
            </button>
          ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ResourcePagination;
