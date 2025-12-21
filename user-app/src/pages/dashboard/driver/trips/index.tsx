import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCar,
  FaMapMarkerAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaRoute,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { tripsAPI } from "@/lib/api";
import { formatDate, formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DriverTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripsAPI.getAll();
      setTrips(response.data.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tripId: string, status: string) => {
    try {
      console.log("Updating trip status:", tripId, status);
      const response = await tripsAPI.updateStatus(tripId, { status });
      console.log("Trip update response:", response);
      toast.success(`Trip ${status.replace("_", " ")} successfully`);
      fetchTrips();
    } catch (error: any) {
      console.error("Trip update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update trip status";
      toast.error(errorMessage);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (filter === "all") return true;
    return trip.status === filter;
  });

  return (
    <>
      <Head>
        <title>My Trips - FleetHub</title>
      </Head>

      <DashboardLayout role="driver">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">My Trips</h1>
            <p className="text-gray-400">Manage your assigned trips</p>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "scheduled", label: "Scheduled" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filter === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-dark-800 hover:bg-dark-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trips List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <div key={trip._id} className="card-hover">
                  <div className="grid md:grid-cols-[1fr,auto] gap-6 p-6">
                    {/* Trip Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            Trip to {trip.destination?.city || "Destination"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Trip ID: {trip._id.slice(-8)}
                          </p>
                        </div>
                        <span className={getStatusBadgeClass(trip.status)}>
                          {trip.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Vehicle */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCar className="text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Vehicle</div>
                            <div className="font-semibold">
                              {trip.vehicle?.make} {trip.vehicle?.model}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {trip.vehicle?.registrationNumber}
                            </div>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCheck className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Customer
                            </div>
                            <div className="font-semibold">
                              {trip.customer?.name ||
                                trip.booking?.customer?.name ||
                                "Customer Name"}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {trip.customer?.email ||
                                trip.booking?.customer?.email ||
                                "customer@example.com"}
                            </div>
                          </div>
                        </div>

                        {/* Date/Time */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaClock className="text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Start Date
                            </div>
                            <div className="font-semibold">
                              {trip.startDate
                                ? formatDate(trip.startDate)
                                : trip.booking?.startDate
                                ? formatDate(trip.booking.startDate)
                                : "Date TBD"}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {trip.startTime ||
                                trip.booking?.startTime ||
                                "Time TBD"}
                            </div>
                          </div>
                        </div>

                        {/* Distance/Duration */}
                        {(trip.distance || trip.duration) && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaRoute className="text-indigo-500" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">
                                Trip Details
                              </div>
                              {trip.distance && (
                                <div className="font-semibold">
                                  {typeof trip.distance === "object"
                                    ? `${
                                        trip.distance.actual ||
                                        trip.distance.planned ||
                                        0
                                      } km`
                                    : `${trip.distance} km`}
                                </div>
                              )}
                              {trip.duration && (
                                <div className="text-sm text-gray-400 mt-1">
                                  {typeof trip.duration === "object"
                                    ? `${
                                        trip.duration.actual ||
                                        trip.duration.planned ||
                                        0
                                      } hrs`
                                    : `${trip.duration} hrs`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pickup/Dropoff */}
                      {trip.pickupLocation && (
                        <div className="bg-dark-800 rounded-lg p-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-green-500 mt-1" />
                            <div>
                              <div className="text-sm text-gray-400">
                                Pickup
                              </div>
                              <div className="text-sm">
                                {trip.pickupLocation.address}
                              </div>
                            </div>
                          </div>
                          {trip.dropoffLocation && (
                            <div className="flex items-start gap-2">
                              <FaMapMarkerAlt className="text-red-500 mt-1" />
                              <div>
                                <div className="text-sm text-gray-400">
                                  Dropoff
                                </div>
                                <div className="text-sm">
                                  {trip.dropoffLocation.address}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Earnings */}
                      {trip.driverEarnings && (
                        <div className="text-sm">
                          <span className="text-gray-400">Your Earnings: </span>
                          <span className="text-primary-500 font-bold">
                            {formatCurrency(trip.driverEarnings)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 md:w-48">
                      {trip.status === "scheduled" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(trip._id, "in_progress")
                          }
                          className="btn btn-primary flex items-center gap-2 justify-center"
                        >
                          <FaCheck />
                          Start Trip
                        </button>
                      )}

                      {trip.status === "in_progress" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(trip._id, "completed")
                          }
                          className="btn btn-primary flex items-center gap-2 justify-center"
                        >
                          <FaCheck />
                          Complete Trip
                        </button>
                      )}

                      {trip.status === "scheduled" && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to cancel this trip?"
                              )
                            ) {
                              handleUpdateStatus(trip._id, "cancelled");
                            }
                          }}
                          className="btn btn-danger flex items-center gap-2 justify-center"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaRoute className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No trips found</h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "You don't have any trips yet"
                  : `No ${filter} trips`}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
