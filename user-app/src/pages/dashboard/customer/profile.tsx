import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaIdCard,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { authAPI } from "@/lib/api";
import {
  updateProfileSchema,
  changePasswordSchema,
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/lib/validations";

export default function CustomerProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;
      setUser(userData);

      // Populate form
      profileForm.reset({
        name: userData.name,
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    setUpdating(true);
    try {
      await authAPI.updateDetails(data);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setChangingPassword(true);
    try {
      await authAPI.updatePassword(data);
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - FleetHub</title>
      </Head>

      <DashboardLayout role="customer">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account settings</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="card p-6 space-y-4 h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <span className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm mt-2 capitalize">
                  {user?.role}
                </span>
              </div>

              <div className="border-t border-dark-700 pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FaIdCard className="text-gray-400" />
                  <span className="text-gray-400">Member since:</span>
                  <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <FaPhone className="text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Update Profile */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Update Profile</h2>

                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...profileForm.register("name")}
                        type="text"
                        className="input pl-10"
                        placeholder="John Doe"
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email - Read Only */}
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={user?.email || ""}
                        className="input pl-10 bg-dark-700/50 cursor-not-allowed"
                        placeholder="john@example.com"
                        disabled
                        readOnly
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="label">Phone Number (Optional)</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...profileForm.register("phone")}
                        type="tel"
                        className="input pl-10"
                        placeholder="+1234567890"
                      />
                    </div>
                    {profileForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="label">Address (Optional)</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        {...profileForm.register("address")}
                        className="input pl-10"
                        rows={3}
                        placeholder="Enter your address"
                      />
                    </div>
                    {profileForm.formState.errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {profileForm.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary"
                  >
                    {updating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Change Password</h2>

                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-5"
                >
                  {/* Current Password */}
                  <div>
                    <label className="label">Current Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...passwordForm.register("currentPassword")}
                        type="password"
                        className="input pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="label">New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...passwordForm.register("newPassword")}
                        type="password"
                        className="input pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="label">Confirm New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...passwordForm.register("confirmPassword")}
                        type="password"
                        className="input pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn btn-primary"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
