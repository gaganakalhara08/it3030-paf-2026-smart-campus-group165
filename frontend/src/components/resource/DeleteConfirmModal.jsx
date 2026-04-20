import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, resource, onConfirm, onCancel, loading }) => {
  if (!isOpen || !resource) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Delete Resource?</h3>
            <p className="text-sm text-slate-500 mt-1">
              You are about to permanently delete <strong className="text-slate-700">"{resource.name}"</strong>. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
