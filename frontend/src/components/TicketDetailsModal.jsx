import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import TicketCommentSection from './TicketCommentSection';

const TicketDetailsModal = ({ ticket, isOpen, onClose, userEmail, userRoles, onTicketUpdated }) => {
  const [ticketData, setTicketData] = useState(ticket);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket?.status);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setTicketData(ticket);
    setNewStatus(ticket?.status);
  }, [ticket]);

  const isAdmin = userRoles?.includes('ROLE_ADMIN');
  const isTechnician = userRoles?.includes('ROLE_TECHNICIAN');
  const isOwner = ticketData?.userId === userEmail || ticketData?.userEmail === userEmail;

  const handleStatusChange = async () => {
    const statusChangeData = {
      status: newStatus,
    };

    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (newStatus === 'REJECTED') {
      statusChangeData.rejectionReason = rejectionReason;
    }

    if (newStatus === 'RESOLVED' && resolutionNotes.trim()) {
      statusChangeData.resolutionNotes = resolutionNotes;
    }

    try {
      setIsUpdatingStatus(true);
      const updated = await ticketService.updateTicketStatus(ticketData.id, statusChangeData);
      setTicketData(updated);
      setSuccessMessage('Ticket status updated successfully');
      onTicketUpdated?.();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update ticket status');
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!isOpen || !ticketData) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ELECTRICAL: '⚡',
      PLUMBING: '🔧',
      HVAC: '❄️',
      FURNITURE: '🪑',
      EQUIPMENT: '🖥️',
      CLEANING: '🧹',
      SECURITY: '🔐',
      IT_SUPPORT: '💻',
      STRUCTURAL: '🏗️',
      OTHER: '📋',
    };
    return icons[category] || '📋';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isValidStatusTransition = (currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return true;
    const validTransitions = {
      OPEN: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['RESOLVED', 'REJECTED'],
      RESOLVED: ['CLOSED'],
      REJECTED: [],
      CLOSED: [],
    };
    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex gap-3 mb-2">
              <span className="text-2xl">{getCategoryIcon(ticketData.category)}</span>
              <h2 className="text-2xl font-bold">{ticketData.title}</h2>
            </div>
            <p className="text-blue-100">Ticket ID: {ticketData.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticketData.status)}`}>
                      {ticketData.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Priority</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticketData.priority)}`}>
                      {ticketData.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</p>
                <p className="text-gray-800 font-medium">{ticketData.category.replace('_', ' ')}</p>
              </div>

              {/* Resource Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resource</p>
                <p className="text-gray-800 font-medium">{ticketData.resourceName}</p>
                <p className="text-sm text-gray-600 mt-1">📍 {ticketData.resourceLocation}</p>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reported By</p>
                <p className="text-gray-800 font-medium">{ticketData.userName}</p>
                <p className="text-sm text-gray-600">{ticketData.userEmail}</p>
                <p className="text-sm text-gray-600 mt-1">📞 {ticketData.contactPhone || 'Not provided'}</p>
              </div>

              {/* Assigned To */}
              {ticketData.assignedToName && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Assigned To</p>
                  <p className="text-gray-800 font-medium">{ticketData.assignedToName}</p>
                  <p className="text-sm text-gray-600">{ticketData.assignedToEmail}</p>
                </div>
              )}

              {/* Dates */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Timeline</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Created:</span> {formatDate(ticketData.createdAt)}
                  </p>
                  {ticketData.resolvedAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Resolved:</span> {formatDate(ticketData.resolvedAt)}
                    </p>
                  )}
                  {ticketData.closedAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Closed:</span> {formatDate(ticketData.closedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticketData.description}</p>
              </div>

              {/* Resolution Notes */}
              {ticketData.resolutionNotes && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">Resolution Notes</p>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticketData.resolutionNotes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {ticketData.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-700 uppercase mb-2">Rejection Reason</p>
                  <p className="text-gray-700 text-sm">{ticketData.rejectionReason}</p>
                </div>
              )}

              {/* Attachments */}
              {ticketData.attachments && ticketData.attachments.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Attachments ({ticketData.attachments.length})</p>
                  <div className="space-y-2">
                    {ticketData.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">{(attachment.fileSize / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:${attachment.fileType};base64,${attachment.fileData}`;
                            link.download = attachment.fileName;
                            link.click();
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Download"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update (Admin/Technician Only) */}
              {(isAdmin || isTechnician) && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase mb-3">Update Status</p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={ticketData.status}>{ticketData.status}</option>
                    {isValidStatusTransition(ticketData.status, 'IN_PROGRESS') && (
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                    )}
                    {isValidStatusTransition(ticketData.status, 'RESOLVED') && (
                      <option value="RESOLVED">RESOLVED</option>
                    )}
                    {isValidStatusTransition(ticketData.status, 'REJECTED') && (
                      <option value="REJECTED">REJECTED</option>
                    )}
                    {isValidStatusTransition(ticketData.status, 'CLOSED') && (
                      <option value="CLOSED">CLOSED</option>
                    )}
                  </select>

                  {newStatus === 'RESOLVED' && (
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add resolution notes (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm resize-none"
                      rows="2"
                    />
                  )}

                  {newStatus === 'REJECTED' && (
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection (required)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm resize-none"
                      rows="2"
                    />
                  )}

                  <button
                    onClick={handleStatusChange}
                    disabled={isUpdatingStatus || newStatus === ticketData.status}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <TicketCommentSection
            ticketId={ticketData.id}
            userEmail={userEmail}
            onCommentAdded={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
