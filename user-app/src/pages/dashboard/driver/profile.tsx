import { useState, useEffect } from "react";
import { NextPage } from "next";
import DashboardLayout from "../../../components/DashboardLayout";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  licenseNumber?: string;
  experience?: number;
  createdAt: string;
}

const DriverProfile: NextPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    experience: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
        setFormData({
          name: result.data.name || "",
          phone: result.data.phone || "",
          licenseNumber: result.data.licenseNumber || "",
          experience: result.data.experience || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const userId = profile?._id;
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
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

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="card p-6 text-center">
          <p className="text-red-400">Error loading profile</p>
          <p className="text-gray-400 text-sm mt-2">
            Please try refreshing the page
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Driver Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="card p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Name
                  </label>
                  <p className="text-lg text-white">{profile.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Email
                  </label>
                  <p className="text-lg text-white">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Phone
                  </label>
                  <p className="text-lg text-white">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Role
                  </label>
                  <p className="text-lg text-white capitalize">
                    {profile.role}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    License Number
                  </label>
                  <p className="text-lg text-white">
                    {profile.licenseNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Experience
                  </label>
                  <p className="text-lg text-white">
                    {profile.experience || 0} years
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Member Since
                  </label>
                  <p className="text-lg text-white">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverProfile;
