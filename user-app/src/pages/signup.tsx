import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaArrowRight,
} from "react-icons/fa";
import { signupSchema, SignupFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      toast.success("Account created successfully!");

      // Auto login after signup
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      switch (user.role) {
        case "customer":
          router.push("/dashboard/customer");
          break;
        case "driver":
          router.push("/dashboard/driver");
          break;
        case "owner":
          router.push("/dashboard/owner");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: "customer",
      label: "Customer",
      description: "Book vehicles for your trips",
      icon: "🚗",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      value: "driver",
      label: "Driver",
      description: "Drive and earn money",
      icon: "👨‍✈️",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      value: "owner",
      label: "Vehicle Owner",
      description: "Manage your fleet",
      icon: "💼",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Sign Up - FleetHub</title>
        <meta name="description" content="Create your FleetHub account" />
      </Head>

      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-3xl font-bold gradient-text inline-block"
            >
              FleetHub
            </Link>
            <p className="text-gray-400 mt-2">
              Create your account and get started
            </p>
          </div>

          {/* Signup Card */}
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="label">I want to</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`relative cursor-pointer ${
                        selectedRole === role.value
                          ? "ring-2 ring-primary-500"
                          : ""
                      }`}
                    >
                      <input
                        {...register("role")}
                        type="radio"
                        value={role.value}
                        className="sr-only"
                      />
                      <div className="card-hover p-4 text-center h-full">
                        <div className="text-3xl mb-2">{role.icon}</div>
                        <div className="font-semibold mb-1">{role.label}</div>
                        <div className="text-xs text-gray-400">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    className="input pl-12"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className="input pl-12"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("phone")}
                    type="tel"
                    id="phone"
                    className="input pl-12"
                    placeholder="1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Driver-specific fields */}
              {selectedRole === "driver" && (
                <>
                  <div>
                    <label htmlFor="licenseNumber" className="label">
                      License Number
                    </label>
                    <div className="relative">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("licenseNumber")}
                        type="text"
                        id="licenseNumber"
                        className="input pl-12"
                        placeholder="DL1234567890"
                      />
                    </div>
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.licenseNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseExpiry" className="label">
                      License Expiry Date
                    </label>
                    <div className="relative">
                      <FaCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("licenseExpiry")}
                        type="date"
                        id="licenseExpiry"
                        className="input pl-12"
                      />
                    </div>
                    {errors.licenseExpiry && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.licenseExpiry.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("password")}
                    type="password"
                    id="password"
                    className="input pl-12"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    id="confirmPassword"
                    className="input pl-12"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-500 hover:text-primary-400 font-semibold"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
