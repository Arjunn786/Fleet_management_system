import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Layout from "@/components/Layout";
import { adminAPI } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

interface Trip {
  _id: string;
  booking: {
    customer: { name: string };
    vehicle: { make: string; model: string; registrationNumber: string };
  };
  driver?: { name: string; email: string };
  startDate: string;
  status: string;
  distance?: number;
  duration?: number;
  driverEarnings?: number;
  destination?: { city: string; state: string };
  createdAt: string;
}

const TripRow = memo(({ trip, onEdit, onDelete }: any) => (
  <tr className="hover:bg-dark-800 transition-colors">
    <td>#{trip._id.slice(-8)}</td>
    <td>
      {trip.booking?.customer?.name || trip.customer?.name || "No Customer"}
      <div className="text-xs text-gray-400">
        {trip.driver?.name || "Unassigned Driver"}
      </div>
    </td>
    <td>
      {trip.booking?.vehicle?.make || trip.vehicle?.make || "Unknown"}{" "}
      {trip.booking?.vehicle?.model || trip.vehicle?.model || "Vehicle"}
      <div className="text-xs text-gray-400">
        {trip.booking?.vehicle?.registrationNumber ||
          trip.vehicle?.registrationNumber ||
          "No Registration"}
      </div>
    </td>
    <td>
      {trip.destination?.city ||
        trip.endLocation ||
        trip.actualEndLocation ||
        "Destination TBD"}
      <div className="text-xs text-gray-400">
        {trip.startDate
          ? formatDate(trip.startDate)
          : trip.booking?.startDate
          ? formatDate(trip.booking.startDate)
          : "Date TBD"}
      </div>
    </td>
    <td>
      {typeof trip.distance === "object"
        ? `${trip.distance.actual || trip.distance.planned || 0} km`
        : trip.distance
        ? `${trip.distance} km`
        : "0 km"}
      <div className="text-xs text-gray-400">
        {typeof trip.duration === "object"
          ? `${trip.duration.actual || trip.duration.planned || 0} hrs`
          : trip.duration
          ? `${trip.duration} hrs`
          : ""}
      </div>
    </td>
    <td>
      <span className={`badge ${getStatusColor(trip.status)}`}>
        {trip.status?.replace("_", " ") || "pending"}
      </span>
    </td>
    <td>
      {trip.driverEarnings ? formatCurrency(trip.driverEarnings) : "$0.00"}
    </td>
    <td>{trip.createdAt ? formatDate(trip.createdAt) : "Unknown"}</td>
    <td>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(trip)}
          className="btn btn-secondary text-xs py-1 px-3"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(trip._id)}
          className="btn btn-danger text-xs py-1 px-3"
        >
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

TripRow.displayName = "TripRow";

const TripModal = memo(({ trip, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    status: trip.status,
    distance: trip.distance || 0,
    duration: trip.duration || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        await adminAPI.updateTrip(trip._id, formData);
        toast.success("Trip updated successfully");
        onSave();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Update failed");
      } finally {
        setSaving(false);
      }
    },
    [formData, trip._id, onSave, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Update Trip</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="input"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="label">Distance (km)</label>
            <input
              type="number"
              value={formData.distance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  distance: parseFloat(e.target.value),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Duration (hours)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseFloat(e.target.value),
                })
              }
              className="input"
            />
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

TripModal.displayName = "TripModal";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllTrips();
      setTrips(response.data.data);
    } catch (error) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await adminAPI.deleteTrip(id);
      toast.success("Trip deleted successfully");
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    }
  }, []);

  const handleEdit = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.booking?.customer?.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        trip.driver?.name?.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination?.city?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrips, currentPage]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trips Management</h1>
          <p className="text-gray-400">Manage all fleet trips</p>
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
                placeholder="Search by customer, driver, or destination..."
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
              <option value="scheduled">Scheduled</option>
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
                    <th>Customer/Driver</th>
                    <th>Vehicle</th>
                    <th>Destination/Date</th>
                    <th>Distance/Duration</th>
                    <th>Status</th>
                    <th>Earnings</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrips.length > 0 ? (
                    paginatedTrips.map((trip) => (
                      <TripRow
                        key={trip._id}
                        trip={trip}
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
                        No trips found
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
                  {Math.min(currentPage * itemsPerPage, filteredTrips.length)}{" "}
                  of {filteredTrips.length} trips
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

        {showModal && selectedTrip && (
          <TripModal
            trip={selectedTrip}
            onClose={() => {
              setShowModal(false);
              setSelectedTrip(null);
            }}
            onSave={fetchTrips}
          />
        )}
      </div>
    </Layout>
  );
}
