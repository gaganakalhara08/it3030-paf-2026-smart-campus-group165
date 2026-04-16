import React from "react";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-red-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock size={16} className="inline mr-1" />;
      case "APPROVED":
        return <CheckCircle size={16} className="inline mr-1" />;
      case "REJECTED":
        return <XCircle size={16} className="inline mr-1" />;
      case "CANCELLED":
        return <AlertCircle size={16} className="inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
        status
      )}`}
    >
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

export default StatusBadge;