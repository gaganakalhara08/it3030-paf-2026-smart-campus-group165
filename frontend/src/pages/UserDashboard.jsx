import React from "react";
import UserHeader from "../components/user/UserHeader";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Component */}
      <UserHeader />

      {/* Welcome Section - Your Part */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Smart Campus Portal</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Manage your campus bookings efficiently. Click on "Booking Dashboard" in the header to view and manage your bookings.
            </p>
            
            <div className="mt-12">
              <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to get started?</h3>
                <p className="text-gray-600 mb-6">
                  Use the buttons in the header above to navigate through the booking system.
                </p>
                <ul className="text-left space-y-3 text-gray-700 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <span>Click "Booking Dashboard" to view all your bookings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <span>Click "Create Booking" to make a new booking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <span>Manage your bookings and track their status</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;