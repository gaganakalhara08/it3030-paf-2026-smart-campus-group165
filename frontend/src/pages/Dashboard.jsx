import React, { useEffect, useState } from "react";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

const Dashboard = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // 🔥 STEP 1: Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);

      // Clean URL
      window.history.replaceState({}, document.title, "/dashboard");
    }

    // 🔥 STEP 2: Fetch user
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token found");
          return;
        }

        const res = await fetch("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("User Data:", data);

        const roles = data.roles || [];

        if (roles.includes("ROLE_ADMIN")) {
          setRole("ADMIN");
        } else if (roles.includes("ROLE_TECHNICIAN")) {
          setRole("TECHNICIAN");
        } else {
          setRole("USER");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // ⏳ Loading
  if (!role) {
    return <div>Loading...</div>;
  }

  // 🎯 Role-based render
  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "TECHNICIAN") return <TechnicianDashboard />;
  return <UserDashboard />;
};

export default Dashboard;