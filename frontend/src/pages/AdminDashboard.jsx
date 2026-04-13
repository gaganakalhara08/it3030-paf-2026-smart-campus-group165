import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TicketAllView from "../pages/TicketAllView";

const AdminDashboard = () => {
  // Get user info from localStorage (set during login)
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <TicketAllView 
            userEmail={userEmail} 
            userName={userName}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;