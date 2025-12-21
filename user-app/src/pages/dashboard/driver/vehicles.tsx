import { useState, useEffect } from "react";
import { NextPage } from "next";
import { FaCar } from "react-icons/fa";
import DashboardLayout from "../../../components/DashboardLayout";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  status: string;
  availability?: string;
  dailyRate: number;
  location: string;
  registrationNumber?: string;
  vehicleType?: string;
  pricePerDay?: number;
  features?: string[];
}

const DriverVehicles: NextPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedVehicles();
  }, []);

  const fetchAssignedVehicles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5000/api/drivers/assigned-vehicles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setVehicles(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Assigned Vehicles 🚗</h1>
            <p className="text-gray-400">
              Vehicles assigned to you for driving
            </p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="mb-4">
              <FaCar className="text-4xl text-gray-400 mx-auto mb-2" />
            </div>
            <p className="text-gray-400 text-lg">
              No vehicles assigned to you currently.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Contact your fleet manager to get vehicle assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="card-hover p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-gray-400 text-sm">{vehicle.year}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === "available" ||
                      vehicle.availability === "available"
                        ? "bg-green-500/20 text-green-400"
                        : vehicle.status === "rented" ||
                          vehicle.availability === "rented"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {vehicle.status || vehicle.availability || "Available"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-xs font-medium text-gray-400">
                      REGISTRATION:
                    </span>
                    <span className="font-mono text-sm">
                      {vehicle.registrationNumber ||
                        vehicle.licensePlate ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-xs font-medium text-gray-400">
                      TYPE:
                    </span>
                    <span className="capitalize">
                      {vehicle.vehicleType || vehicle.type || "N/A"}
                    </span>
                  </div>

                  {vehicle.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-xs font-medium text-gray-400">
                        LOCATION:
                      </span>
                      <span>{vehicle.location}</span>
                    </div>
                  )}

                  {vehicle.pricePerDay && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-xs font-medium text-gray-400">
                        DAILY RATE:
                      </span>
                      <span className="font-semibold text-green-400">
                        ${vehicle.pricePerDay}/day
                      </span>
                    </div>
                  )}

                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-gray-400 block mb-2">
                        FEATURES:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full capitalize"
                          >
                            {feature.replace("_", " ")}
                          </span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                            +{vehicle.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverVehicles;
