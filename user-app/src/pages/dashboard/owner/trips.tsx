import { useState, useEffect } from "react";
import { NextPage } from "next";
import DashboardLayout from "../../../components/DashboardLayout";

interface Trip {
  _id: string;
  booking: {
    _id: string;
    customer: {
      name: string;
      email: string;
    };
    vehicle: {
      make: string;
      model: string;
      licensePlate: string;
    };
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string;
  };
  driver?: {
    _id: string;
    name: string;
    email: string;
  };
  startTime: string;
  endTime?: string;
  status: string;
  startLocation: string;
  endLocation?: string;
  distance?: number | { actual?: number; planned?: number };
  createdAt: string;
}

const OwnerTrips: NextPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrips();
    fetchAvailableDrivers();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTrips(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5000/api/drivers/assignments?status=approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAvailableDrivers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching available drivers:", error);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedTrip) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/trips/${selectedTrip._id}/assign-driver`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverId }),
        }
      );

      if (response.ok) {
        alert("Driver assigned successfully!");
        setShowAssignmentModal(false);
        setSelectedTrip(null);
        fetchTrips();
      } else {
        throw new Error("Failed to assign driver");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert("Error assigning driver");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (filter === "all") return true;
    return trip.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">My Vehicle Trips</h1>
          <div className="flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Trips</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-400">
              {filter === "all"
                ? "No trips found for your vehicles."
                : `No ${filter} trips found.`}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Trip Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Vehicle & Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-800 divide-y divide-gray-700">
                  {filteredTrips.map((trip) => (
                    <tr key={trip._id} className="hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            Trip #{trip._id.slice(-8)}
                          </div>
                          <div className="text-gray-400">
                            {trip.startLocation}
                            {trip.endLocation && ` → ${trip.endLocation}`}
                          </div>
                          {trip.distance && (
                            <div className="text-gray-400">
                              Distance:{" "}
                              {typeof trip.distance === "object"
                                ? `${
                                    trip.distance.actual ||
                                    trip.distance.planned ||
                                    0
                                  } km`
                                : `${trip.distance} km`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            {trip.booking?.vehicle?.make}{" "}
                            {trip.booking?.vehicle?.model}
                          </div>
                          <div className="text-gray-400">
                            {trip.booking?.vehicle?.licensePlate}
                          </div>
                          <div className="text-gray-400">
                            Customer:{" "}
                            {trip.booking?.customer?.name || "Customer Name"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {trip.driver ? (
                            <div>
                              <div className="font-medium text-white">
                                {trip.driver.name}
                              </div>
                              <div className="text-gray-400">
                                {trip.driver.email}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowAssignmentModal(true);
                              }}
                              className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                            >
                              Assign Driver
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div>
                          <div className="font-medium">
                            Started: {new Date(trip.startTime).toLocaleString()}
                          </div>
                          {trip.endTime && (
                            <div className="text-gray-400">
                              Ended: {new Date(trip.endTime).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            trip.status
                          )}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ${trip.booking.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trip Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">
                {trips.length}
              </div>
              <div className="text-sm text-gray-400">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {trips.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {trips.filter((t) => t.status === "in_progress").length}
              </div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                $
                {trips
                  .reduce(
                    (sum, trip) => sum + (trip.booking.totalAmount || 0),
                    0
                  )
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {showAssignmentModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Assign Driver
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedTrip(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                Trip: #{selectedTrip._id.slice(-8)}
              </p>
              <p className="text-sm text-gray-400">
                Vehicle: {selectedTrip.booking.vehicle.make}{" "}
                {selectedTrip.booking.vehicle.model}
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300">
                Available Approved Drivers:
              </h4>
              {availableDrivers.filter(
                (assignment) => assignment.status === "approved"
              ).length > 0 ? (
                availableDrivers
                  .filter((assignment) => assignment.status === "approved")
                  .map((assignment) => (
                    <div
                      key={assignment._id}
                      className="p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-dark-700"
                      onClick={() => handleAssignDriver(assignment.driver._id)}
                    >
                      <div className="font-medium text-white">
                        {assignment.driver.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {assignment.driver.email}
                      </div>
                      {assignment.driver.licenseNumber && (
                        <div className="text-sm text-gray-400">
                          License: {assignment.driver.licenseNumber}
                        </div>
                      )}
                      {assignment.driver.experience && (
                        <div className="text-sm text-gray-400">
                          Experience: {assignment.driver.experience} years
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No approved drivers available for this vehicle.</p>
                  <p className="text-sm mt-1">
                    Please approve driver assignments first in the Driver
                    Assignments section.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerTrips;
