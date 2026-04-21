import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import toast from 'react-hot-toast';

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const DEFAULT_RESOURCE = {
    resourceId: 'N/A',
    resourceName: 'General Support',
    resourceLocation: 'Not specified',
  };

  const [formData, setFormData] = useState({
    ...DEFAULT_RESOURCE,
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    contactEmail: '',
    contactPhone: '',
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    contactPhone: '',
    contactEmail: '',
  });

  const categories = [
    'ELECTRICAL',
    'PLUMBING',
    'CLEANING',
    'SECURITY',
    'IT_SUPPORT',
    'ACADEMIC',
    'OTHER',
  ];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactPhone') {
      const typingRegex = /^\d{0,10}$/;
      if (!typingRegex.test(value)) return;

      const phoneRegex = /^\d{10}$/;
      const phoneError = value && !phoneRegex.test(value) ? 'Contact number must be exactly 10 digits' : '';
      setFieldErrors((prev) => ({ ...prev, contactPhone: phoneError }));
    }

    if (name === 'contactEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailError = value && !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      setFieldErrors((prev) => ({ ...prev, contactEmail: emailError }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    const maxAttachments = 3;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg'];

    if (attachments.length >= maxAttachments) {
      const message = `Maximum ${maxAttachments} attachments allowed`;
      setError(message);
      toast.error(message);
      return;
    }

    for (let file of files) {
      if (attachments.length >= maxAttachments) {
        const message = `Maximum ${maxAttachments} attachments allowed`;
        setError(message);
        toast.error(message);
        break;
      }

      if (!allowedTypes.includes(file.type)) {
        const message = `${file.name}: only PNG and JPG images are allowed`;
        setError(message);
        toast.error(message);
        continue;
      }

      if (file.size > maxSize) {
        const message = `File ${file.name} is too large. Maximum 5MB allowed`;
        setError(message);
        toast.error(message);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64Data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.contactEmail.trim() ||
      !formData.contactPhone.trim()
    ) {
      const message = 'Please fill in all required fields';
      setError(message);
      toast.error(message);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      const message = 'Please enter a valid email address';
      setError(message);
      toast.error(message);
      return;
    }

    const contactNumber = formData.contactPhone.trim();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNumber)) {
      const message = 'Contact number must be exactly 10 digits';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...DEFAULT_RESOURCE,
        ...formData,
        attachments: attachments,
      };

      await ticketService.createTicket(submitData);
      toast.success('Ticket created successfully!');
      onTicketCreated();
      onClose();
      setFormData({
        ...DEFAULT_RESOURCE,
        title: '',
        description: '',
        category: 'OTHER',
        priority: 'MEDIUM',
        contactEmail: '',
        contactPhone: '',
      });
      setFieldErrors({
        contactPhone: '',
        contactEmail: '',
      });
      setAttachments([]);
    } catch (err) {
      const message = err.message || 'Failed to create ticket';
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create New Ticket</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {fieldErrors.contactEmail && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.contactEmail}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="10 digit number"
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {fieldErrors.contactPhone && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.contactPhone}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title of the issue"
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed description of the issue..."
              required
              disabled={loading}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attachments (Evidence Images - Max 3)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileUpload}
                disabled={loading || attachments.length >= 3}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-700 font-medium">Upload images as evidence</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
              <p className="text-xs text-gray-400 mt-1">
                {attachments.length} / 3 attachments
              </p>
            </div>

            {/* Attached Files */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a1 1 0 001 1h12a1 1 0 001-1V6a2 2 0 00-2-2H4zm0 4v4a2 2 0 002 2h8a2 2 0 002-2V8H4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      disabled={loading}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
