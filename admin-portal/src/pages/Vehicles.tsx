import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaCar,
} from "react-icons/fa";
import Layout from "@/components/Layout";
import { adminAPI } from "@/lib/api";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: string;
  fuelType: string;
  pricePerDay: number;
  availability: string;
  owner: { name: string; email: string };
  createdAt: string;
}

const VehicleCard = memo(({ vehicle, onEdit, onDelete }: any) => (
  <div className="card-hover overflow-hidden">
    <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
      <FaCar className="text-white text-6xl opacity-50" />
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold mb-1">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-400">{vehicle.year}</p>
        </div>
        <span className={`badge ${getStatusColor(vehicle.availability)}`}>
          {vehicle.availability}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Registration:</span>
          <span>{vehicle.registrationNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Type:</span>
          <span className="capitalize">{vehicle.vehicleType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fuel:</span>
          <span className="capitalize">{vehicle.fuelType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Owner:</span>
          <span>{vehicle.owner?.name || "N/A"}</span>
        </div>
      </div>

      <div className="mb-4 pb-4 border-b border-dark-700">
        <div className="text-2xl font-bold text-primary-500">
          {formatCurrency(vehicle.pricePerDay)}
        </div>
        <div className="text-xs text-gray-400">per day</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onEdit(vehicle)}
          className="btn btn-secondary text-sm"
        >
          <FaEdit />
          Edit
        </button>
        <button
          onClick={() => onDelete(vehicle._id)}
          className="btn btn-danger text-sm"
        >
          <FaTrash />
          Delete
        </button>
      </div>
    </div>
  </div>
));

VehicleCard.displayName = "VehicleCard";

const VehicleModal = memo(({ vehicle, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(
    vehicle || {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      registrationNumber: "",
      vehicleType: "sedan",
      fuelType: "petrol",
      pricePerDay: 0,
      availability: "available",
      capacity: { passengers: 4, luggage: 2 },
      location: { city: "", state: "", address: "" },
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        if (vehicle) {
          await adminAPI.updateVehicle(vehicle._id, formData);
          toast.success("Vehicle updated successfully");
        } else {
          await adminAPI.createVehicle(formData);
          toast.success("Vehicle created successfully");
        }
        onSave();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Operation failed");
      } finally {
        setSaving(false);
      }
    },
    [formData, vehicle, onSave, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-xl font-bold">
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Make *</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Model *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Registration Number *</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Vehicle Type *</label>
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                className="input"
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="luxury">Luxury</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="label">Fuel Type *</label>
              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value })
                }
                className="input"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="label">Price Per Day ($) *</label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerDay: parseFloat(e.target.value),
                  })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Availability *</label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="input"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="label">Passengers *</label>
              <input
                type="number"
                value={formData.capacity?.passengers || 4}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: {
                      ...formData.capacity,
                      passengers: parseInt(e.target.value),
                    },
                  })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Luggage *</label>
              <input
                type="number"
                value={formData.capacity?.luggage || 2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: {
                      ...formData.capacity,
                      luggage: parseInt(e.target.value),
                    },
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save Vehicle"}
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

VehicleModal.displayName = "VehicleModal";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllVehicles();
      setVehicles(response.data.data);
    } catch (error) {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await adminAPI.deleteVehicle(id);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    }
  }, []);

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || vehicle.vehicleType === typeFilter;
      const matchesStatus =
        !statusFilter || vehicle.availability === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehicles Management</h1>
            <p className="text-gray-400">Manage all fleet vehicles</p>
          </div>
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <FaPlus />
            Add Vehicle
          </button>
        </div>

        <div className="card p-4">
          <div className="grid md:grid-cols-4 gap-4">
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
                placeholder="Search vehicles..."
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="card p-4 flex items-center justify-center gap-2">
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
            )}
          </>
        )}

        {showModal && (
          <VehicleModal
            vehicle={selectedVehicle}
            onClose={() => {
              setShowModal(false);
              setSelectedVehicle(null);
            }}
            onSave={fetchVehicles}
          />
        )}
      </div>
    </Layout>
  );
}
