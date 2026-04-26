import React, { useState } from "react";
import { CheckCircle, XCircle, Calendar, Clock, Users, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";

const ApprovalCard = ({ booking, onApprove, onReject }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsLoading(true);
    try {
      await onReject(rejectionReason);
      setShowRejectForm(false);
      setRejectionReason("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white shadow-sm transition-colors hover:border-emerald-200">
      {/* Header */}
      <div className="border-b border-amber-100 bg-amber-50 p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {booking.resourceName}
            </h3>
            <p className="text-xs text-gray-500">{booking.resourceType}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* User Info */}
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-xs text-gray-600 font-semibold mb-1">Requested By</p>
          <p className="font-semibold text-gray-800">{booking.userName}</p>
          <p className="text-xs text-gray-600">{booking.userEmail}</p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-700">
          <div className="p-2 bg-gray-100 rounded">
            <Clock size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Location</p>
            <p className="font-semibold">{booking.resourceLocation}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-2 bg-gray-100 rounded">
              <Calendar size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="font-semibold text-sm">{booking.bookingDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-2 bg-gray-100 rounded">
              <Clock size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Time</p>
              <p className="font-semibold text-sm">
                {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Attendees */}
        <div className="flex items-center gap-2 text-gray-700">
          <div className="p-2 bg-gray-100 rounded">
            <Users size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Expected Attendees</p>
            <p className="font-semibold">{booking.expectedAttendees} / {booking.capacity} people</p>
          </div>
        </div>

        {/* Purpose */}
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold mb-1">Purpose</p>
          <p className="text-gray-800 text-sm line-clamp-2">{booking.purpose}</p>
        </div>
      </div>

      {/* Rejection Form */}
      {showRejectForm && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Rejection Reason <span className="text-red-600">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this booking is being rejected..."
            rows="3"
            className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
        {!showRejectForm ? (
          <>
            <button
              onClick={() => {
                setIsLoading(true);
                onApprove();
              }}
              disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {isLoading ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all"
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare size={18} />
              {isLoading ? "Rejecting..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason("");
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalCard;
