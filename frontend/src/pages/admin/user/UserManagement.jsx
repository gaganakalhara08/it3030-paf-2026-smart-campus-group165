import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { API_BASE_URL } from "../../../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔵 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // 🔵 Update role
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

      toast.success("Role updated successfully");
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="bg-slate-800 border-b border-purple-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6 w-full">
            <h1 className="text-3xl font-bold text-white">👥 User Management</h1>
            <p className="text-purple-300 mt-1">Manage users and assign roles</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto w-full">

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-12 w-12 border-b-2 border-purple-400 rounded-full"></div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-purple-500 border-opacity-30 rounded-lg p-6">

                <table className="w-full text-left">
                  <thead>
                    <tr className="text-purple-300 border-b border-purple-500">
                      <th className="py-3">Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Change Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const currentRole = Array.from(user.roles)[0];

                      return (
                        <tr key={user.id} className="border-b border-slate-700">
                          <td className="py-3 text-white">{user.name}</td>
                          <td className="text-purple-300">{user.email}</td>

                          <td className="text-yellow-400 font-semibold">
                            {currentRole}
                          </td>

                          <td>
                            <select
                              value={currentRole}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              className="bg-slate-700 text-white px-3 py-1 rounded border border-purple-500"
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
        </div>
      </div>
    </div>
  );
};

export default UserManagement;