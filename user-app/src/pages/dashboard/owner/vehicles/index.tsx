import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaGasPump,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { vehiclesAPI } from "@/lib/api";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OwnerVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getMyVehicles();
      setVehicles(response.data.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await vehiclesAPI.delete(vehicleId);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  return (
    <>
      <Head>
        <title>My Vehicles - FleetHub</title>
      </Head>

      <DashboardLayout role="owner">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Vehicles</h1>
              <p className="text-gray-400">Manage your fleet</p>
            </div>
            <Link
              href="/dashboard/owner/vehicles/new"
              className="btn btn-primary inline-flex items-center gap-2 text-sm font-medium"
            >
              <FaPlus className="text-sm" />
              Add Vehicle
            </Link>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="card-hover overflow-hidden">
                  {/* Vehicle Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <FaCar className="text-white text-6xl opacity-50" />
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-400">{vehicle.year}</p>
                      </div>
                      <span
                        className={getStatusBadgeClass(vehicle.availability)}
                      >
                        {vehicle.availability}
                      </span>
                    </div>

                    {/* Registration */}
                    <div className="text-sm text-gray-400 mb-3">
                      {vehicle.registrationNumber}
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaUsers />
                        <span>{vehicle.capacity.passengers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaGasPump />
                        <span className="capitalize">{vehicle.fuelType}</span>
                      </div>
                      <div className="capitalize">{vehicle.vehicleType}</div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-dark-700">
                      <div className="text-2xl font-bold text-primary-500">
                        {formatCurrency(vehicle.pricePerDay)}
                      </div>
                      <div className="text-xs text-gray-400">per day</div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        href={`/dashboard/owner/vehicles/${vehicle._id}`}
                        className="btn btn-secondary text-xs py-2 flex items-center gap-1"
                      >
                        <FaEye />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/owner/vehicles/${vehicle._id}/edit`}
                        className="btn btn-secondary text-xs py-2 flex items-center gap-1"
                      >
                        <FaEdit />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="btn btn-danger text-xs py-2 flex items-center gap-1"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaCar className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vehicles yet</h3>
              <p className="text-gray-400 mb-6">
                Add your first vehicle to get started
              </p>
              <Link
                href="/dashboard/owner/vehicles/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FaPlus />
                Add Vehicle
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
