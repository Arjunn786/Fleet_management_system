import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Layout from "@/components/Layout";
import { adminAPI } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  customer: { name: string; email: string };
  vehicle: { make: string; model: string; registrationNumber: string };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  bookingType: string;
  createdAt: string;
}

const BookingRow = memo(({ booking, onEdit, onDelete }: any) => (
  <tr className="hover:bg-dark-800 transition-colors">
    <td>#{booking._id.slice(-8)}</td>
    <td>{booking.customer?.name || "N/A"}</td>
    <td>
      {booking.vehicle?.make} {booking.vehicle?.model}
      <div className="text-xs text-gray-400">
        {booking.vehicle?.registrationNumber}
      </div>
    </td>
    <td>
      {formatDate(booking.startDate)}
      <div className="text-xs text-gray-400">
        to {formatDate(booking.endDate)}
      </div>
    </td>
    <td>{formatCurrency(booking.totalAmount)}</td>
    <td>
      <span className={`badge ${getStatusColor(booking.status)}`}>
        {booking.status}
      </span>
    </td>
    <td className="capitalize">{booking.bookingType}</td>
    <td>{formatDate(booking.createdAt)}</td>
    <td>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(booking)}
          className="btn btn-secondary text-xs py-1 px-3"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(booking._id)}
          className="btn btn-danger text-xs py-1 px-3"
        >
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

BookingRow.displayName = "BookingRow";

const StatusModal = memo(({ booking, onClose, onSave }: any) => {
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        await adminAPI.updateBooking(booking._id, { status });
        toast.success("Booking status updated");
        onSave();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Update failed");
      } finally {
        setSaving(false);
      }
    },
    [status, booking._id, onSave, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Update Booking Status</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Updating..." : "Update"}
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

StatusModal.displayName = "StatusModal";

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllBookings();
      setBookings(response.data.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await adminAPI.deleteBooking(id);
      toast.success("Booking deleted successfully");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete booking");
    }
  }, []);

  const handleEdit = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.vehicle?.make.toLowerCase().includes(search.toLowerCase()) ||
        booking.vehicle?.model.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bookings Management</h1>
          <p className="text-gray-400">Manage all vehicle bookings</p>
        </div>

        <div className="card p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="input pl-10"
                placeholder="Search by customer or vehicle..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

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
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <BookingRow
                        key={booking._id}
                        booking={booking}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400"
                      >
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-dark-800 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredBookings.length
                  )}{" "}
                  of {filteredBookings.length} bookings
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showModal && selectedBooking && (
          <StatusModal
            booking={selectedBooking}
            onClose={() => {
              setShowModal(false);
              setSelectedBooking(null);
            }}
            onSave={fetchBookings}
          />
        )}
      </div>
    </Layout>
  );
}
