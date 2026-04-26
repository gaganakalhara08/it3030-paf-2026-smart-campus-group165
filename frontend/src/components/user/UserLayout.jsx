import React from "react";
import Sidebar from "../Sidebar";
import UserHeader from "./UserHeader";

const UserLayout = ({ children, user, headerActions, contentClassName = "" }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <UserHeader user={user} actions={headerActions} />
        <div className={`mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 ${contentClassName}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
