import { useState, useEffect } from "react";
import { NextPage } from "next";
import DashboardLayout from "../../../components/DashboardLayout";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  businessName?: string;
  businessAddress?: string;
  businessLicense?: string;
  createdAt: string;
}

const OwnerProfile: NextPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessLicense: "",
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
          businessName: result.data.businessName || "",
          businessAddress: result.data.businessAddress || "",
          businessLicense: result.data.businessLicense || "",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Vehicle Owner Profile 👨‍💼
            </h1>
            <p className="text-gray-400">
              Manage your business and personal information
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-primary"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="card p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Name</label>
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
                  <label className="label">Phone</label>
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
                  <label className="label">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="input"
                    placeholder="Your business or company name"
                  />
                </div>

                <div>
                  <label className="label">Business License Number</label>
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessLicense: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="Your business license number"
                  />
                </div>
              </div>

              <div>
                <label className="label">Business Address</label>
                <textarea
                  value={formData.businessAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessAddress: e.target.value,
                    })
                  }
                  rows={3}
                  className="input"
                  placeholder="Your business address"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Name
                    </label>
                    <p className="text-lg font-semibold">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Email
                    </label>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Phone
                    </label>
                    <p className="text-lg">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Role
                    </label>
                    <p className="text-lg capitalize">{profile.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Member Since
                    </label>
                    <p className="text-lg">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-700">
                <h3 className="text-xl font-semibold mb-4">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Business Name
                    </label>
                    <p className="text-lg">
                      {profile.businessName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Business License
                    </label>
                    <p className="text-lg font-mono">
                      {profile.businessLicense || "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-400 block mb-1">
                      Business Address
                    </label>
                    <p className="text-lg">
                      {profile.businessAddress || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerProfile;
