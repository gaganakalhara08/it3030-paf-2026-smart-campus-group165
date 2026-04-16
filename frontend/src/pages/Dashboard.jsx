import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 🔥 Token is already stored by Login.jsx
        // Just get it from localStorage (don't extract from URL again)
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("❌ No token found, redirecting to login");
          navigate("/login");
          setLoading(false);
          return;
        }

        console.log("✅ Token found, fetching user data...");

        const res = await fetch("http://localhost:8080/api/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("❌ Failed to fetch user, status:", res.status);
          localStorage.removeItem("token");
          navigate("/login");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("✅ User Data:", data);

        const roles = data.roles || [];

        if (roles.includes("ROLE_ADMIN")) {
          setRole("ADMIN");
        } else if (roles.includes("ROLE_TECHNICIAN")) {
          setRole("TECHNICIAN");
        } else {
          setRole("USER");
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        localStorage.removeItem("token");
        navigate("/login");
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // ⏳ Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  // 🎯 Role-based render
  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "TECHNICIAN") return <TechnicianDashboard />;
  return <UserDashboard />;
};

export default Dashboard;