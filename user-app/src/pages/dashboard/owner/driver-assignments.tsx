import Head from "next/head";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaCar,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

interface DriverAssignment {
  _id: string;
  driver: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    experience?: number;
  };
  vehicle: {
    _id: string;
    make: string;
    model: string;
    year: number;
    registrationNumber: string;
    vehicleType: string;
  };
  status: "pending" | "approved" | "rejected" | "active" | "inactive";
  assignedDate: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedDate?: string;
  createdAt: string;
}

export default function DriverAssignments() {
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5000/api/drivers/assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAssignments(result.data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load driver assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentReview = async (
    assignmentId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/drivers/assignments/${assignmentId}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success(`Driver assignment ${status} successfully`);
        fetchAssignments(); // Refresh the list
      } else {
        throw new Error("Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Failed to update assignment status");
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    return assignment.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      case "active":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <>
      <Head>
        <title>Driver Assignments - FleetHub</title>
      </Head>

      <DashboardLayout role="owner">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Driver Assignments</h1>
            <p className="text-gray-400">
              Manage driver registrations and approvals for your vehicles
            </p>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
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

          {/* Assignments List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment._id} className="card p-6">
                  <div className="grid md:grid-cols-[1fr,auto] gap-6">
                    {/* Assignment Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            Assignment #{assignment._id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Created {formatDate(assignment.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <span
                            className={getStatusBadgeClass(assignment.status)}
                          >
                            {assignment.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Driver */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Driver</div>
                            <div className="font-semibold">
                              {assignment.driver.name}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {assignment.driver.email}
                            </div>
                            {assignment.driver.licenseNumber && (
                              <div className="text-sm text-gray-400 mt-1">
                                License: {assignment.driver.licenseNumber}
                              </div>
                            )}
                            {assignment.driver.experience && (
                              <div className="text-sm text-gray-400">
                                Experience: {assignment.driver.experience} years
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCar className="text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Vehicle</div>
                            <div className="font-semibold">
                              {assignment.vehicle.make}{" "}
                              {assignment.vehicle.model}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {assignment.vehicle.registrationNumber}
                            </div>
                            <div className="text-sm text-gray-400">
                              {assignment.vehicle.vehicleType} (
                              {assignment.vehicle.year})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Date */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaCalendar className="text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">
                            Assignment Date
                          </div>
                          <div className="font-semibold">
                            {formatDate(assignment.assignedDate)}
                          </div>
                          {assignment.approvedDate && (
                            <div className="text-sm text-gray-400 mt-1">
                              Approved: {formatDate(assignment.approvedDate)}
                              {assignment.approvedBy &&
                                ` by ${assignment.approvedBy.name}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Pending Assignments */}
                    {assignment.status === "pending" && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                          onClick={() =>
                            handleAssignmentReview(assignment._id, "approved")
                          }
                          className="btn btn-primary text-sm py-2"
                        >
                          ✓ Approve Driver
                        </button>
                        <button
                          onClick={() =>
                            handleAssignmentReview(assignment._id, "rejected")
                          }
                          className="btn btn-danger text-sm py-2"
                        >
                          ✗ Reject Driver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No driver assignments found
              </h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "No drivers have requested to drive your vehicles yet"
                  : `No ${filter} driver assignments`}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
