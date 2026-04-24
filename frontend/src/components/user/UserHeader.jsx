import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import headerBg from "../../assets/Green.jpg";

const UserHeader = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  return (
    <div
      className="relative px-6 py-6 border-b border-gray-200"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🔥 Overlay (lighter + cleaner) */}
      <div className="absolute inset-0" />

      {/* 🔥 CONTENT */}
      <div className="relative flex justify-end items-center px-6 h-30">

        <div className="flex items-center gap-6">

          {/* 🔔 Notification */}
          <button className="text-black hover:text-green-200 transition">
            <Bell size={22} />
          </button>

          {/* 👤 User */}
          <p className="text-black font-semibold text-lg drop-shadow-sm">
            {userName}
          </p>

        </div>
      </div>
    </div>
  );
};

export default UserHeader;