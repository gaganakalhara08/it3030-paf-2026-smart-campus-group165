import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BookingPagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {/* First Page */}
        {getPageNumbers()[0] > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all"
            >
              1
            </button>
            {getPageNumbers()[0] > 1 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page Range */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-md"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page + 1}
          </button>
        ))}

        {/* Last Page */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>

      {/* Page Info */}
      <span className="ml-4 text-gray-600 font-semibold">
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
};

export default BookingPagination;