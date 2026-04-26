import React from "react";
import StatusBadge from "./StatusBadge";

const BookingCard = ({ booking, onView, onEdit, onCancel, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{booking.resourceName}</h3>
            <p className="text-sm text-gray-500">{booking.resourceType}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="space-y-2 mb-4 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">{booking.resourceLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{booking.bookingDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {booking.startTime} - {booking.endTime}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          <span className="font-semibold">Purpose:</span> {booking.purpose}
        </p>

        <div className="flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded transition-all"
            >
              View
            </button>
          )}
          {onEdit && booking.status === "PENDING" && (
            <button
              onClick={onEdit}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded transition-all"
            >
              Edit
            </button>
          )}
          {onCancel && (booking.status === "APPROVED" || booking.status === "PENDING") && (
            <button
              onClick={onCancel}
              className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded transition-all"
            >
              Cancel
            </button>
          )}
          {onDelete && (booking.status === "PENDING" || booking.status === "REJECTED") && (
            <button
              onClick={onDelete}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Export StatusBadge as a static method for easy access
BookingCard.StatusBadge = StatusBadge;

export default BookingCard;