import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // 🔥 Check token in URL as well
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (!token && !tokenFromUrl) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;