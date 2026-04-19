import React, { useState, useEffect } from 'react';
import { commentService } from '../services/ticketService';

const TicketCommentSection = ({ ticketId, userEmail, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getTicketComments(ticketId);
      setComments(data);
      setError('');
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.addComment(ticketId, { content: newComment });
      setNewComment('');
      setSuccessMessage('Comment added successfully');
      fetchComments();
      onCommentAdded?.();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.updateComment(ticketId, commentId, { content: editingContent });
      setEditingCommentId(null);
      setSuccessMessage('Comment updated successfully');
      fetchComments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update comment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setSubmitting(true);
      await commentService.deleteComment(ticketId, commentId);
      setSuccessMessage('Comment deleted successfully');
      fetchComments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (role) => {
    if (role === 'TECHNICIAN' || role === 'STAFF') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Activity & Comments</h3>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Add a Comment</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment or reply here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="3"
          disabled={submitting}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="inline-block animate-spin">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="text-gray-600">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              {editingCommentId === comment.id ? (
                // Edit Mode
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                    rows="3"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{comment.userName}</p>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-gray-400 ml-2">(edited)</span>
                      )}
                    </div>

                    {/* Edit/Delete Buttons - Only for Comment Owner */}
                    {true && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="p-1.5 text-gray-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit comment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 text-gray-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete comment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="ml-13 pt-2">
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketCommentSection;
