import React from 'react';
import { TrendingUp, Calendar, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

const BookingStats = ({ stats, loading }) => {
  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total || 0,
      icon: Calendar,
      color: 'blue',
      trend: '+12% from last month',
    },
    {
      label: 'Pending',
      value: stats.pending || 0,
      icon: AlertCircle,
      color: 'yellow',
      subtext: 'Awaiting approval',
    },
    {
      label: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      color: 'green',
      subtext: 'Active bookings',
    },
    {
      label: 'Rejected',
      value: stats.rejected || 0,
      icon: XCircle,
      color: 'red',
      subtext: 'Not approved',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled || 0,
      icon: Trash2,
      color: 'gray',
      subtext: 'User cancelled',
    },
    {
      label: 'This Month',
      value: stats.currentMonth || 0,
      icon: TrendingUp,
      color: 'purple',
      subtext: 'New bookings',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const borderMap = {
    blue: 'border-blue-200',
    yellow: 'border-yellow-200',
    green: 'border-green-200',
    red: 'border-red-200',
    gray: 'border-gray-200',
    purple: 'border-purple-200',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${card.color}-400 hover:shadow-lg transition-all ${borderMap[card.color]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '-' : card.value}</p>
                {card.subtext && <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>}
                {card.trend && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> {card.trend}</p>}
              </div>
              <div className={`${colorMap[card.color]} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingStats;
