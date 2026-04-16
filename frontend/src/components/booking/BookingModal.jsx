import React from "react";
import { X, Calendar, Clock, MapPin, Users, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";

const BookingModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {booking.resourceName}
            </h2>
            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-semibold">Status:</span>
            <StatusBadge status={booking.status} />
          </div>

          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-blue-600" />
                <span className="text-gray-600 font-semibold">Location</span>
              </div>
              <p className="text-gray-800 font-semibold ml-8">
                {booking.resourceLocation}
              </p>
              <p className="text-gray-600 text-sm ml-8">{booking.resourceType}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-blue-600" />
                <span className="text-gray-600 font-semibold">Capacity</span>
              </div>
              <p className="text-gray-800 font-semibold ml-8">
                {booking.capacity} people
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-gray-600" />
                <span className="text-gray-600 font-semibold">Date</span>
              </div>
              <p className="text-gray-800 font-semibold ml-8">
                {booking.bookingDate}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className="text-gray-600" />
                <span className="text-gray-600 font-semibold">Time</span>
              </div>
              <p className="text-gray-800 font-semibold ml-8">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
          </div>

          {/* Expected Attendees */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-gray-600" />
              <span className="text-gray-600 font-semibold">
                Expected Attendees
              </span>
            </div>
            <p className="text-gray-800 font-semibold ml-8">
              {booking.expectedAttendees} people
            </p>
          </div>

          {/* Purpose */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-gray-600" />
              <span className="text-gray-600 font-semibold">Purpose</span>
            </div>
            <p className="text-gray-800 ml-8 leading-relaxed">
              {booking.purpose}
            </p>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-semibold mb-3">Booked By</p>
            <div className="flex items-center gap-3 ml-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">
                  {booking.userName?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {booking.userName}
                </p>
                <p className="text-sm text-gray-600">{booking.userEmail}</p>
              </div>
            </div>
          </div>

          {/* Admin Reason (if rejected) */}
          {booking.status === "REJECTED" && booking.adminReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold mb-2">
                Rejection Reason
              </p>
              <p className="text-red-600 ml-4">{booking.adminReason}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 border-t pt-4">
            <div>
              <p className="font-semibold">Created</p>
              <p>{new Date(booking.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Last Updated</p>
              <p>{new Date(booking.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;