import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Only check if token exists - that's it!
    const token = localStorage.getItem("token");
    
    if (token) {
      console.log("✅ Token found, allowing access");
      setIsAuthenticated(true);
    } else {
      console.log("❌ No token found, redirecting to login");
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []); // Empty dependency - only run once

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;