import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout, { AdminPageHeader } from "../../../components/admin/AdminLayout";
import { API_BASE_URL } from "../../../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <AdminPageHeader
        eyebrow="Users"
        title="User Management"
        description="Review campus users and assign the correct access roles."
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Current Role</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const currentRole = Array.from(user.roles)[0];

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{user.name}</td>
                      <td className="px-5 py-4 text-slate-500">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {currentRole.replace("ROLE_", "")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                          <option value="ROLE_USER">USER</option>
                          <option value="ROLE_ADMIN">ADMIN</option>
                          <option value="ROLE_TECHNICIAN">TECHNICIAN</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
