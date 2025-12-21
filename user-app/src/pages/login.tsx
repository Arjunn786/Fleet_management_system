import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");

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
        case "admin":
          router.push("/dashboard/admin");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - FleetHub</title>
        <meta name="description" content="Login to your FleetHub account" />
      </Head>

      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
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
              Welcome back! Please login to your account.
            </p>
          </div>

          {/* Login Card */}
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="#"
                  className="text-sm text-primary-500 hover:text-primary-400"
                >
                  Forgot password?
                </Link>
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
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary-500 hover:text-primary-400 font-semibold"
                >
                  Sign up
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
