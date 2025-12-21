import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Link from "next/link";
import DashboardLayout from "../../../../../components/DashboardLayout";

// Valid enum values for vehicle features
const VALID_FEATURES = [
  "gps",
  "bluetooth",
  "wifi",
  "ac",
  "camera",
  "sensors",
  "sunroof",
  "seats",
  "audio",
  "usb",
];

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
}

const EditVehicle: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: 2024,
    licensePlate: "",
    type: "sedan",
    status: "available",
    dailyRate: 0,
    location: "",
    features: [] as string[],
    description: "",
  });

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
        const vehicleData = data.vehicle;
        setVehicle(vehicleData);

        // Convert invalid features to valid ones
        const validFeatures =
          vehicleData.features?.filter((feature: string) =>
            VALID_FEATURES.includes(feature)
          ) || [];

        setFormData({
          make: vehicleData.make || "",
          model: vehicleData.model || "",
          year: vehicleData.year || 2024,
          licensePlate: vehicleData.licensePlate || "",
          type: vehicleData.type || "sedan",
          status: vehicleData.status || "available",
          dailyRate: vehicleData.dailyRate || 0,
          location: vehicleData.location || "",
          features: validFeatures,
          description: vehicleData.description || "",
        });
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

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = [...formData.features];
    const index = currentFeatures.indexOf(feature);

    if (index > -1) {
      currentFeatures.splice(index, 1);
    } else {
      currentFeatures.push(feature);
    }

    setFormData({ ...formData, features: currentFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Vehicle updated successfully!");
        router.push(`/dashboard/owner/vehicles/${id}`);
      } else {
        const errorData = await response.json();
        alert(
          `Error updating vehicle: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Error updating vehicle");
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/owner/vehicles/${id}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Vehicle Details
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make *
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1900"
                max="2030"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate *
              </label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate ($) *
              </label>
              <input
                type="number"
                value={formData.dailyRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {VALID_FEATURES.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {feature.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter vehicle description..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Updating..." : "Update Vehicle"}
            </button>
            <Link
              href={`/dashboard/owner/vehicles/${id}`}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditVehicle;
