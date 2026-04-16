import React from "react";
import { Filter } from "lucide-react";

const BookingFilters = ({ statusFilter, onStatusChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-600" />
        <span className="font-semibold text-gray-700">Filter by Status:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange("")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === ""
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => onStatusChange("PENDING")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === "PENDING"
              ? "bg-yellow-600 text-white shadow-md"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => onStatusChange("APPROVED")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === "APPROVED"
              ? "bg-green-600 text-white shadow-md"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => onStatusChange("REJECTED")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === "REJECTED"
              ? "bg-red-600 text-white shadow-md"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => onStatusChange("CANCELLED")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === "CANCELLED"
              ? "bg-gray-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Cancelled
        </button>
      </div>
    </div>
  );
};

export default BookingFilters;