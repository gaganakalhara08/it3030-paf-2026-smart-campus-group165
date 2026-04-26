import React from "react";
import AdminSidebar from "./AdminSidebar";

export const AdminPageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {eyebrow}
          </p>
        )}
        <h1 className="m-0 text-2xl font-bold tracking-normal text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-slate-500 md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

const AdminLayout = ({ onLogout, children, className = "" }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <AdminSidebar onLogout={onLogout} />
    <main className={`ml-64 min-h-screen ${className}`}>{children}</main>
  </div>
);

export default AdminLayout;
