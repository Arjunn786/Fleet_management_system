import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Link from "next/link";
import DashboardLayout from "../../../../components/DashboardLayout";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  status: string;
  dailyRate: number;
  location: string;
  features: string[];
  description: string;
  images: string[];
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const VehicleDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicle(data.vehicle);
      } else {
        console.error("Vehicle not found");
        router.push("/dashboard/owner/vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Vehicle deleted successfully!");
        router.push("/dashboard/owner/vehicles");
      } else {
        alert("Error deleting vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Error deleting vehicle");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">Vehicle not found</p>
          <Link
            href="/dashboard/owner/vehicles"
            className="text-blue-600 hover:underline"
          >
            Back to Vehicles
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/owner/vehicles"
              className="text-blue-600 hover:underline"
            >
              ← Back to Vehicles
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/owner/vehicles/${vehicle._id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Vehicle
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Vehicle
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="h-64 bg-gray-200">
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Vehicle Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Make:</span>
                      <span className="text-gray-900">{vehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Model:</span>
                      <span className="text-gray-900">{vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Year:</span>
                      <span className="text-gray-900">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        License Plate:
                      </span>
                      <span className="text-gray-900">
                        {vehicle.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="text-gray-900 capitalize">
                        {vehicle.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "available"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "rented"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Rental Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Daily Rate:
                      </span>
                      <span className="text-gray-900">
                        ${vehicle.dailyRate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Location:
                      </span>
                      <span className="text-gray-900">{vehicle.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features && vehicle.features.length > 0 ? (
                      vehicle.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {feature.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No features listed</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">
                    {vehicle.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Owner Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">
                        {vehicle.owner?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">
                        {vehicle.owner?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Created
                  </h3>
                  <p className="text-gray-700">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VehicleDetail;
