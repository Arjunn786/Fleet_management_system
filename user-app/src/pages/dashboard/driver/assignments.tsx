import Head from "next/head";
import { useEffect, useState } from "react";
import { FaCar, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { driversAPI } from "@/lib/api";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DriverAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await driversAPI.getMyAssignments();
      setAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (
    assignmentId: string,
    action: "accept" | "reject"
  ) => {
    try {
      if (action === "accept") {
        await driversAPI.updateAssignmentStatus(assignmentId, "active");
        toast.success("Assignment accepted successfully!");
      } else {
        await driversAPI.updateAssignmentStatus(assignmentId, "inactive");
        toast.success("Assignment rejected");
      }
      fetchAssignments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${action} assignment`
      );
    }
  };

  return (
    <>
      <Head>
        <title>Vehicle Assignments - FleetHub</title>
      </Head>

      <DashboardLayout role="driver">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehicle Assignments</h1>
            <p className="text-gray-400">
              View and manage your vehicle assignments
            </p>
          </div>

          {/* Assignments List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="card-hover p-6">
                  <div className="grid md:grid-cols-[1fr,auto] gap-6">
                    {/* Assignment Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {assignment.vehicle?.make}{" "}
                            {assignment.vehicle?.model}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {assignment.vehicle?.registrationNumber}
                          </p>
                        </div>
                        <span
                          className={getStatusBadgeClass(assignment.status)}
                        >
                          {assignment.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Vehicle Details */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCar className="text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Vehicle Type
                            </div>
                            <div className="font-semibold capitalize">
                              {assignment.vehicle?.vehicleType}
                            </div>
                            <div className="text-sm text-gray-400 mt-1 capitalize">
                              {assignment.vehicle?.fuelType}
                            </div>
                          </div>
                        </div>

                        {/* Assignment Date */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaClock className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Assigned On
                            </div>
                            <div className="font-semibold">
                              {formatDate(assignment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="bg-dark-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">
                          Owner Information
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Name:</span>
                            <span>{assignment.owner?.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Email:</span>
                            <span>{assignment.owner?.email}</span>
                          </div>
                          {assignment.owner?.phone && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Phone:</span>
                              <span>{assignment.owner.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {assignment.status === "pending" && (
                      <div className="flex flex-col gap-3 md:w-48">
                        <button
                          onClick={() =>
                            handleAssignment(assignment._id, "accept")
                          }
                          className="btn btn-primary"
                        >
                          <FaCheck />
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to reject this assignment?"
                              )
                            ) {
                              handleAssignment(assignment._id, "reject");
                            }
                          }}
                          className="btn btn-danger"
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </div>
                    )}

                    {assignment.status === "accepted" && (
                      <div className="md:w-48">
                        <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <FaCheck />
                          Accepted
                        </div>
                      </div>
                    )}

                    {assignment.status === "rejected" && (
                      <div className="md:w-48">
                        <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <FaTimes />
                          Rejected
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaCar className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
              <p className="text-gray-400">
                You don't have any vehicle assignments
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
