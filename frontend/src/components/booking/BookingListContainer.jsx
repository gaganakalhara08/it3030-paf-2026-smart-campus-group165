import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, X, ChevronDown } from 'lucide-react';
import BookingCard from './BookingCard';

const BookingListContainer = ({
  bookings,
  loading,
  error,
  onAction,
  showFilters = true,
  showSearch = true,
  emptyMessage = 'No bookings found',
}) => {
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedResourceType, setSelectedResourceType] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  const resourceTypes = ['ALL', 'ROOM', 'LAB', 'EQUIPMENT', 'FACILITY'];
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Resource Name (A-Z)' },
    { value: 'name-desc', label: 'Resource Name (Z-A)' },
    { value: 'status', label: 'Status' },
  ];

  useEffect(() => {
    let filtered = bookings.filter(booking => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          booking.resourceName?.toLowerCase().includes(search) ||
          booking.resourceLocation?.toLowerCase().includes(search) ||
          booking.purpose?.toLowerCase().includes(search) ||
          booking.userName?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && booking.status !== selectedStatus) {
        return false;
      }

      // Resource type filter
      if (selectedResourceType !== 'ALL' && booking.resourceType !== selectedResourceType) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.bookingDate) - new Date(a.bookingDate);
        case 'date-asc':
          return new Date(a.bookingDate) - new Date(b.bookingDate);
        case 'name-asc':
          return (a.resourceName || '').localeCompare(b.resourceName || '');
        case 'name-desc':
          return (b.resourceName || '').localeCompare(a.resourceName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, selectedStatus, selectedResourceType, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedResourceType('ALL');
    setSortBy('date-desc');
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedStatus !== 'ALL' ? 1 : 0,
    selectedResourceType !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleExport = () => {
    const csv = [
      ['Resource', 'Type', 'Location', 'Date', 'Time', 'Status', 'Purpose'],
      ...filteredBookings.map(b => [
        b.resourceName,
        b.resourceType,
        b.resourceLocation,
        b.bookingDate,
        `${b.startTime} - ${b.endTime}`,
        b.status,
        b.purpose,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading bookings</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by resource, location, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {filteredBookings.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        )}

        {/* Filters Toggle */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showAdvancedFilters
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Resource Type</label>
              <select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'ALL' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="w-full px-3 py-2 bg-blue-50 rounded-lg text-sm text-gray-700">
                <span className="font-semibold text-blue-600">{filteredBookings.length}</span> results
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg shadow-md h-64 animate-pulse"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">📭</div>
          <p className="text-gray-600 font-medium">{emptyMessage}</p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Clear filters to see all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onView={() => onAction('view', booking)}
              onEdit={() => onAction('edit', booking)}
              onCancel={() => onAction('cancel', booking)}
              onDelete={() => onAction('delete', booking)}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredBookings.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      )}
    </div>
  );
};

export default BookingListContainer;
