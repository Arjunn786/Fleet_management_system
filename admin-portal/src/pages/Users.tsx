import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import Layout from "@/components/Layout";
import { adminAPI } from "@/lib/api";
import { formatDate, getStatusColor, debounce } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

// Memoized table row component
const UserRow = memo(({ user, onEdit, onDelete }: any) => (
  <tr className="hover:bg-dark-800 transition-colors">
    <td>{user.name}</td>
    <td>{user.email}</td>
    <td>
      <span className={`badge ${getStatusColor(user.role)}`}>{user.role}</span>
    </td>
    <td>{user.phone || "N/A"}</td>
    <td>
      <span
        className={`badge ${user.isActive ? "bg-green-500" : "bg-gray-500"}`}
      >
        {user.isActive ? "Active" : "Inactive"}
      </span>
    </td>
    <td>{formatDate(user.createdAt)}</td>
    <td>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="btn btn-secondary text-xs py-1 px-3"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(user._id)}
          className="btn btn-danger text-xs py-1 px-3"
        >
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

UserRow.displayName = "UserRow";

// Memoized modal component
const UserModal = memo(({ user, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(
    user || {
      name: "",
      email: "",
      password: "",
      role: "customer",
      phone: "",
      isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        if (user) {
          await adminAPI.updateUser(user._id, formData);
          toast.success("User updated successfully");
        } else {
          await adminAPI.createUser(formData);
          toast.success("User created successfully");
        }
        onSave();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Operation failed");
      } finally {
        setSaving(false);
      }
    },
    [formData, user, onSave, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-xl font-bold">
            {user ? "Edit User" : "Add User"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
                required
              />
            </div>

            {!user && (
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input"
                  required={!user}
                />
              </div>
            )}

            <div>
              <label className="label">Role *</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="input"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={formData.isActive ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                  })
                }
                className="input"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

UserModal.displayName = "UserModal";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedUser(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedUser(null);
  }, []);

  const handleSave = useCallback(() => {
    fetchUsers();
  }, []);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Memoized paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Users Management</h1>
            <p className="text-gray-400">Manage all system users</p>
          </div>
          <button onClick={handleAdd} className="btn btn-primary">
            <FaPlus />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="input pl-10"
                placeholder="Search by name or email..."
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <UserRow
                        key={user._id}
                        user={user}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-dark-800 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                  of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary text-sm"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center gap-2">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`btn text-sm ${
                            currentPage === page
                              ? "btn-primary"
                              : "btn-secondary"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <UserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
      </div>
    </Layout>
  );
}
