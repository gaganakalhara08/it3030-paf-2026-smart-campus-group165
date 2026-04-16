import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const RoleBasedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8080/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const userRoles = data.roles || [];

        if (userRoles.includes(requiredRole)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error("You don't have permission to access this page");
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;